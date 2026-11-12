import { PerformanceReviewModel, PerformanceTrackerModel } from './performance.model';
import { IPerformanceReview, IPerformanceTracker } from './performance.types';

export class PerformanceRepository {
  // Reviews
  async getReviews(filter: any = {}): Promise<IPerformanceReview[]> {
    const reviews = await PerformanceReviewModel.find(filter).sort({ createdAt: -1 });
    if (reviews.length === 0 && Object.keys(filter).length === 0) {
      const sample = [
        {
          employeeName: 'Sarah Johnson',
          jobTitle: 'Engineering',
          reviewPeriod: '2026-01-01 - 2026-06-30',
          dueDate: '2026-07-15',
          reviewer: 'Alex Smith',
          reviewStatus: 'Approved' as const,
          score: 4.8,
          ratings: [
            { competency: 'Technical Architecture & Code Efficiency', score: 98, status: 'Exceeds Expectation' },
            { competency: 'Cross-functional Collaboration', score: 94, status: 'Exceeds Expectation' },
            { competency: 'Strategic Project Delivery & Planning', score: 91, status: 'Meets Expectation' },
          ],
        },
        {
          employeeName: 'Michael Chen',
          jobTitle: 'Engineering',
          reviewPeriod: '2026-01-01 - 2026-06-30',
          dueDate: '2026-07-20',
          reviewer: 'Sarah Johnson',
          reviewStatus: 'Pending' as const,
          score: 4.4,
        },
      ];
      return await PerformanceReviewModel.insertMany(sample);
    }
    return reviews;
  }

  async createReview(data: Partial<IPerformanceReview>): Promise<IPerformanceReview> {
    const review = new PerformanceReviewModel(data);
    return await review.save();
  }

  async findReviewById(id: string): Promise<IPerformanceReview | null> {
    return await PerformanceReviewModel.findById(id);
  }

  async updateReview(id: string, data: Partial<IPerformanceReview>): Promise<IPerformanceReview | null> {
    return await PerformanceReviewModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteReview(id: string): Promise<boolean> {
    const res = await PerformanceReviewModel.findByIdAndDelete(id);
    return !!res;
  }

  // Trackers
  async getTrackers(filter: any = {}): Promise<IPerformanceTracker[]> {
    const trackers = await PerformanceTrackerModel.find(filter).sort({ createdAt: -1 });
    if (trackers.length === 0 && Object.keys(filter).length === 0) {
      const sample = [
        {
          trackerName: 'Tracker for paul',
          employeeName: 'Paul Walker',
          addedDate: '2026-01-07',
          modifiedDate: '2026-08-31',
          logs: ['Completed Q1 goal ahead of time', 'Led architecture review'],
        },
      ];
      return await PerformanceTrackerModel.insertMany(sample);
    }
    return trackers;
  }

  async createTracker(data: Partial<IPerformanceTracker>): Promise<IPerformanceTracker> {
    const tracker = new PerformanceTrackerModel(data);
    return await tracker.save();
  }

  async findTrackerById(id: string): Promise<IPerformanceTracker | null> {
    return await PerformanceTrackerModel.findById(id);
  }
}

export const performanceRepository = new PerformanceRepository();
