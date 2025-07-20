from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
import os
from dotenv import load_dotenv
from RESTAPI.llm_model import text_to_sql  # SQL generation function
from RESTAPI.schema_parser import convert_schema_to_model_format, convert_mongo_metadata_to_json  # Schema conversion
from bson import ObjectId


# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("DB_HOST")
MONGO_DB_NAME = "LangSQL"

class GenerateSQLView(APIView):
    
    def post(self, request):
        """
        API endpoint to accept user_id and question, then return the SQL query.
        """
        user_id = request.data.get("user_id")
        question = request.data.get("question")
        connectionId = request.data.get("connectionId")

        # Check for Authorization header and validate the Bearer token
        # token = request.headers.get("Authorization")
         
        # if not token:
        #     return Response({"error": "Authorization token is missing"}, status=status.HTTP_401_UNAUTHORIZED)
        
        # if token:
        #     SECRET_KEY = os.getenv("SECRET_KEY")
        #     if SECRET_KEY != token:
        #         return Response({"error": "Authorization token is missing"}, status=status.HTTP_401_UNAUTHORIZED)
            
        if not user_id or not question or not connectionId:
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Establish MongoDB connection
            mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            db = mongo_client[MONGO_DB_NAME]

            # Test connection
            mongo_client.server_info()
            # Fetch user metadata from MongoDB
            user_metadata = db.databasemetadatas.find_one({"userId": ObjectId(user_id), "connectionId": ObjectId(connectionId)})
            user_matadata=convert_mongo_metadata_to_json(user_metadata)
            
            

            if not user_metadata:
                return Response({"error": "User metadata not found"}, status=status.HTTP_404_NOT_FOUND)

            # Extract schema JSON from the database
            schema_data = user_matadata.get("tables", [])

            if not schema_data:
                return Response({"error": "Schema data missing in metadata"}, status=status.HTTP_400_BAD_REQUEST)

            # Convert schema to required format
            formatted_schema = convert_schema_to_model_format({"data": {"tables": schema_data}})

            # Generate SQL query using LLM model
            sql_query = text_to_sql(question, formatted_schema)

            return Response({"sql_query": sql_query}, status=status.HTTP_200_OK)

        except ServerSelectionTimeoutError:
            return Response({"error": "MongoDB connection failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        finally:
            # Close MongoDB connection
            mongo_client.close()