import Grievance from '../models/Grievance.js';
import User from '../models/User.js';

// ── GET SUMMARY STATS ────────────────────────────────────────
export const getSummary = async (req, res) => {
  try {
    const [
      total,
      pending,
      underReview,
      inProgress,
      resolved,
      closed,
      totalStudents,
    ] = await Promise.all([
      Grievance.countDocuments(),
      Grievance.countDocuments({ status: 'Pending' }),
      Grievance.countDocuments({ status: 'Under Review' }),
      Grievance.countDocuments({ status: 'In Progress' }),
      Grievance.countDocuments({ status: 'Resolved' }),
      Grievance.countDocuments({ status: 'Closed' }),
      User.countDocuments({ role: 'Student' }),
    ]);

    // Calculate resolution rate
    const resolutionRate = total > 0
      ? Math.round(((resolved + closed) / total) * 100)
      : 0;

    res.status(200).json({
      success: true,
      summary: {
        total,
        pending,
        underReview,
        inProgress,
        resolved,
        closed,
        totalStudents,
        resolutionRate,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET MONTHLY TRENDS ───────────────────────────────────────
// Returns submitted vs resolved per month for the last 6 months
export const getMonthlyTrends = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // MongoDB aggregation — group by year+month
    const submitted = await Grievance.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year:  { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const resolvedData = await Grievance.aggregate([
      {
        $match: {
          updatedAt: { $gte: sixMonthsAgo },
          status: { $in: ['Resolved', 'Closed'] },
        },
      },
      {
        $group: {
          _id: {
            year:  { $year: '$updatedAt' },
            month: { $month: '$updatedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Build last 6 months labels
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        label: d.toLocaleString('en', { month: 'short' }),
        year:  d.getFullYear(),
        month: d.getMonth() + 1,
      });
    }

    // Map aggregation results to months
    const trends = months.map((m) => {
      const sub = submitted.find(
        (s) => s._id.year === m.year && s._id.month === m.month
      );
      const res = resolvedData.find(
        (r) => r._id.year === m.year && r._id.month === m.month
      );
      return {
        month:     m.label,
        submitted: sub?.count || 0,
        resolved:  res?.count || 0,
      };
    });

    res.status(200).json({ success: true, trends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET CATEGORY BREAKDOWN ───────────────────────────────────
export const getCategoryBreakdown = async (req, res) => {
  try {
    const data = await Grievance.aggregate([
      {
        $group: {
          _id:   '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const total = data.reduce((sum, d) => sum + d.count, 0);

    const breakdown = data.map((d) => ({
      category:   d._id,
      count:      d.count,
      percentage: total > 0 ? Math.round((d.count / total) * 100) : 0,
    }));

    res.status(200).json({ success: true, breakdown });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET STATUS DISTRIBUTION ──────────────────────────────────
export const getStatusDistribution = async (req, res) => {
  try {
    const data = await Grievance.aggregate([
      {
        $group: {
          _id:   '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({ success: true, distribution: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};