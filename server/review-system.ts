import { collection, addDoc, getDoc, doc, updateDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase-init';

export interface Review {
  id: string;
  vendorId: string;
  customerId: string;
  leadId: string;
  rating: number;
  comment: string;
  createdAt: any;
  verified: boolean;
}

export interface VendorStats {
  totalReviews: number;
  ratingAverage: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

/**
 * Submit a review for a vendor
 */
export async function submitReview(reviewData: {
  vendorId: string;
  customerId: string;
  leadId: string;
  rating: number;
  comment: string;
}): Promise<void> {
  try {
    // Add review to reviews collection
    await addDoc(collection(db, 'reviews'), {
      ...reviewData,
      createdAt: new Date(),
      verified: true
    });

    // Update vendor's rating statistics
    await updateVendorRating(reviewData.vendorId, reviewData.rating);
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
}

/**
 * Update vendor's rating statistics
 */
async function updateVendorRating(vendorId: string, newRating: number): Promise<void> {
  try {
    const vendorRef = doc(db, 'vendors', vendorId);
    const vendorDoc = await getDoc(vendorRef);
    
    if (vendorDoc.exists()) {
      const vendorData = vendorDoc.data();
      const currentTotalReviews = vendorData.totalReviews || 0;
      const currentRatingAverage = vendorData.ratingAverage || 0;
      
      // Calculate new averages
      const newTotalReviews = currentTotalReviews + 1;
      const newTotalRating = (currentRatingAverage * currentTotalReviews) + newRating;
      const newRatingAverage = newTotalRating / newTotalReviews;
      
      // Update rating breakdown
      const ratingBreakdown = vendorData.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      ratingBreakdown[newRating] = (ratingBreakdown[newRating] || 0) + 1;
      
      await updateDoc(vendorRef, {
        totalReviews: newTotalReviews,
        ratingAverage: newRatingAverage,
        ratingBreakdown
      });
    }
  } catch (error) {
    console.error('Error updating vendor rating:', error);
    throw error;
  }
}

/**
 * Get reviews for a vendor
 */
export async function getVendorReviews(vendorId: string, limitCount: number = 10): Promise<Review[]> {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('vendorId', '==', vendorId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
  } catch (error) {
    console.error('Error getting vendor reviews:', error);
    return [];
  }
}

/**
 * Get vendor statistics
 */
export async function getVendorStats(vendorId: string): Promise<VendorStats> {
  try {
    const vendorRef = doc(db, 'vendors', vendorId);
    const vendorDoc = await getDoc(vendorRef);
    
    if (vendorDoc.exists()) {
      const data = vendorDoc.data();
      return {
        totalReviews: data.totalReviews || 0,
        ratingAverage: data.ratingAverage || 0,
        ratingBreakdown: data.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }
    
    return {
      totalReviews: 0,
      ratingAverage: 0,
      ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  } catch (error) {
    console.error('Error getting vendor stats:', error);
    return {
      totalReviews: 0,
      ratingAverage: 0,
      ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }
}

/**
 * Get customer reviews (reviews written by a customer)
 */
export async function getCustomerReviews(customerId: string): Promise<Review[]> {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
  } catch (error) {
    console.error('Error getting customer reviews:', error);
    return [];
  }
}