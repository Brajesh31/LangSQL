import mongoose from 'mongoose'

const ActivitySchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['schema', 'query', 'feedback'],
      required: true
    },
    status: {
      type: String,
      enum: ['success', 'error', 'warning'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    // Optional fields based on type
    tables: Number,
    dialect: {
      type: String,
      enum: ['Trino', 'Spark SQL']
    },
    optimizations: [String],
    improvement: String,
    impact: String
  }, {
    timestamps: true
  });

  const Activity = mongoose.model('Activity', ActivitySchema)

  export default Activity

