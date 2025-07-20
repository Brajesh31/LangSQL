import mongoose from "mongoose";

const StatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    schemasGenerated: {
      current: {
        type: Number,
        default: 0,
      },
      previous: {
        type: Number,
        default: 0,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
    queriesTranslated: {
      current: {
        type: Number,
        default: 0,
      },
      previous: {
        type: Number,
        default: 0,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
    executionSuccess: {
      current: {
        type: Number,
        default: 0,
      },
      previous: {
        type: Number,
        default: 0,
      },
      totalQueries: {
        type: Number,
        default: 0,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
    avgOptimization: {
      current: {
        type: Number,
        default: 0,
      },
      previous: {
        type: Number,
        default: 0,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Helper methods for Stats
StatsSchema.methods.calculateTrends = function () {
  const calculateTrend = (current, previous) => {
    const trend = current >= previous ? "up" : "down";
    const percentage =
      previous === 0 ? 0 : ((current - previous) / previous) * 100;
    return { trend, percentage };
  };

  return {
    schemasGenerated: calculateTrend(
      this.schemasGenerated.current,
      this.schemasGenerated.previous
    ),
    queriesTranslated: calculateTrend(
      this.queriesTranslated.current,
      this.queriesTranslated.previous
    ),
    executionSuccess: calculateTrend(
      this.executionSuccess.current,
      this.executionSuccess.previous
    ),
    avgOptimization: calculateTrend(
      this.avgOptimization.current,
      this.avgOptimization.previous
    ),
  };
};

const Stats = mongoose.model("Stats", StatsSchema);

export default Stats;
