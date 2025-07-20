import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# Load model & tokenizer
tokenizer = AutoTokenizer.from_pretrained("gaussalgo/T5-LM-Large-text2sql-spider")
model = AutoModelForSeq2SeqLM.from_pretrained("gaussalgo/T5-LM-Large-text2sql-spider")
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

# Format input for LLM
def format_input(question, schema):
    """
    Formats the question and schema into a prompt for the model.
    Ensures primary keys and foreign keys are preserved.
    """
    return f"Question: {question} Schema: {schema}"

# Generate SQL query
def text_to_sql(question, schema):
    """
    Generates SQL query from natural language question and schema.
    """
    input_text = format_input(question, schema)

    inputs = tokenizer(input_text, return_tensors="pt", padding=True, truncation=True, max_length=512).to(device)

    with torch.no_grad():  # Disable gradients for inference
        outputs = model.generate(**inputs, max_length=256, num_beams=5, early_stopping=True)

    sql_query = tokenizer.decode(outputs[0], skip_special_tokens=True, clean_up_tokenization_spaces=False)
    return sql_query