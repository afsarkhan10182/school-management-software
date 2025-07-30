/**
 * School ERP SaaS Pricing Calculator
 * Calculates pricing based on student count, staff count, and selected modules
 */

class SchoolERPPricingCalculator {
    constructor() {
        this.pricingTiers = {
            // Revenue-based tiers (recommended)
            revenueBased: {
                under3L: { price: 12, maxRevenue: 300000 },
                threeTo5L: { price: 15, maxRevenue: 500000 },
                fiveTo10L: { price: 18, maxRevenue: 1000000 },
                over10L: { price: 20, maxRevenue: Infinity }
            },
            
            // Simple student count tiers
            studentBased: {
                small: { price: 15, maxStudents: 300 },
                medium: { price: 18, maxStudents: 1000 },
                large: { price: 16, maxStudents: 3000 },
                enterprise: { price: 14, maxStudents: Infinity }
            }
        };

        this.addonModules = {
            sms: { price: 0.10, type: 'per_sms' },
            transport: { price: 500, type: 'monthly' },
            hostel: { price: 500, type: 'monthly' },
            hr: { price: 1000, type: 'monthly' },
            mobileApp: { price: 1500, type: 'monthly' },
            api: { price: 1000, type: 'monthly' },
            biometric: { price: 1500, type: 'monthly' }
        };

        this.discounts = {
            quarterly: 0.10, // 10% off
            yearly: 0.15,    // 15% off
            rural: 0.20,     // 20% off
            ngo: 0.25        // 25% off
        };
    }

    /**
     * Calculate base pricing based on student count
     */
    calculateBasePrice(studentCount, pricingModel = 'studentBased') {
        let pricePerStudent = 0;
        
        if (pricingModel === 'studentBased') {
            if (studentCount <= 300) {
                pricePerStudent = this.pricingTiers.studentBased.small.price;
            } else if (studentCount <= 1000) {
                pricePerStudent = this.pricingTiers.studentBased.medium.price;
            } else if (studentCount <= 3000) {
                pricePerStudent = this.pricingTiers.studentBased.large.price;
            } else {
                pricePerStudent = this.pricingTiers.studentBased.enterprise.price;
            }
        }

        return {
            pricePerStudent,
            basePrice: studentCount * pricePerStudent,
            studentCount
        };
    }

    /**
     * Calculate staff pricing
     */
    calculateStaffPrice(staffCount) {
        const freeStaffLimit = 15;
        const pricePerStaff = 5;
        
        if (staffCount <= freeStaffLimit) {
            return 0;
        }
        
        return (staffCount - freeStaffLimit) * pricePerStaff;
    }

    /**
     * Calculate add-on module costs
     */
    calculateAddonCosts(selectedModules, smsCount = 0) {
        let totalAddonCost = 0;
        const addonBreakdown = {};

        selectedModules.forEach(module => {
            if (this.addonModules[module]) {
                const addon = this.addonModules[module];
                
                if (addon.type === 'per_sms') {
                    addonBreakdown[module] = smsCount * addon.price;
                    totalAddonCost += addonBreakdown[module];
                } else {
                    addonBreakdown[module] = addon.price;
                    totalAddonCost += addon.price;
                }
            }
        });

        return {
            totalAddonCost,
            addonBreakdown
        };
    }

    /**
     * Calculate total pricing with all components
     */
    calculateTotalPricing(options) {
        const {
            studentCount,
            staffCount,
            selectedModules = [],
            smsCount = 0,
            billingCycle = 'monthly',
            schoolType = 'regular',
            estimatedRevenue = 0
        } = options;

        // Calculate base price
        const baseCalculation = this.calculateBasePrice(studentCount);
        
        // Calculate staff price
        const staffPrice = this.calculateStaffPrice(staffCount);
        
        // Calculate addon costs
        const addonCalculation = this.calculateAddonCosts(selectedModules, smsCount);
        
        // Calculate subtotal
        const subtotal = baseCalculation.basePrice + staffPrice + addonCalculation.totalAddonCost;
        
        // Apply discounts
        let discountPercentage = 0;
        let discountReason = '';
        
        if (billingCycle === 'quarterly') {
            discountPercentage = this.discounts.quarterly;
            discountReason = 'Quarterly billing discount';
        } else if (billingCycle === 'yearly') {
            discountPercentage = this.discounts.yearly;
            discountReason = 'Yearly billing discount';
        }
        
        if (schoolType === 'rural') {
            discountPercentage += this.discounts.rural;
            discountReason += discountReason ? ' + Rural school discount' : 'Rural school discount';
        } else if (schoolType === 'ngo') {
            discountPercentage += this.discounts.ngo;
            discountReason += discountReason ? ' + NGO/Trust discount' : 'NGO/Trust discount';
        }
        
        const discountAmount = subtotal * discountPercentage;
        const totalPrice = subtotal - discountAmount;

        return {
            baseCalculation,
            staffPrice,
            addonCalculation,
            subtotal,
            discountPercentage,
            discountAmount,
            discountReason,
            totalPrice,
            billingCycle,
            schoolType,
            estimatedRevenue
        };
    }

    /**
     * Generate pricing breakdown for display
     */
    generatePricingBreakdown(options) {
        const calculation = this.calculateTotalPricing(options);
        
        return {
            summary: {
                totalMonthlyPrice: calculation.totalPrice,
                pricePerStudent: calculation.baseCalculation.pricePerStudent,
                studentCount: calculation.baseCalculation.studentCount,
                billingCycle: calculation.billingCycle
            },
            breakdown: {
                basePrice: calculation.baseCalculation.basePrice,
                staffPrice: calculation.staffPrice,
                addonCosts: calculation.addonCalculation.totalAddonCost,
                subtotal: calculation.subtotal,
                discount: calculation.discountAmount,
                total: calculation.totalPrice
            },
            details: {
                addonBreakdown: calculation.addonCalculation.addonBreakdown,
                discountReason: calculation.discountReason,
                discountPercentage: calculation.discountPercentage
            }
        };
    }

    /**
     * Get pricing recommendations based on school profile
     */
    getPricingRecommendations(studentCount, estimatedRevenue = 0) {
        const recommendations = [];
        
        // Base recommendation
        recommendations.push({
            type: 'base',
            title: 'Standard Plan',
            description: `₹${this.calculateBasePrice(studentCount).pricePerStudent}/student/month`,
            price: this.calculateBasePrice(studentCount).basePrice,
            features: ['Admission Management', 'Fee Management', 'Attendance', 'Reports', 'Basic Support']
        });

        // Add popular add-ons
        recommendations.push({
            type: 'addon',
            title: 'With SMS Notifications',
            description: 'Add SMS alerts for parents',
            additionalPrice: 500, // Assuming 500 SMS/month
            features: ['SMS Alerts', 'Parent Notifications', 'Attendance Alerts']
        });

        recommendations.push({
            type: 'addon',
            title: 'With Transport Management',
            description: 'Complete transport tracking',
            additionalPrice: 500,
            features: ['Route Management', 'Driver Tracking', 'Parent App Access']
        });

        // Yearly discount recommendation
        const yearlyPrice = this.calculateTotalPricing({
            studentCount,
            staffCount: 20,
            billingCycle: 'yearly'
        }).totalPrice * 12;

        recommendations.push({
            type: 'discount',
            title: 'Yearly Plan (15% Off)',
            description: 'Pay yearly and save 15%',
            price: yearlyPrice,
            savings: this.calculateBasePrice(studentCount).basePrice * 12 * 0.15,
            features: ['All Standard Features', 'Priority Support', 'Free Setup']
        });

        return recommendations;
    }
}

// Example usage and export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SchoolERPPricingCalculator;
} else if (typeof window !== 'undefined') {
    window.SchoolERPPricingCalculator = SchoolERPPricingCalculator;
}

// Example usage:
/*
const calculator = new SchoolERPPricingCalculator();

// Calculate pricing for the school you mentioned (1100 students)
const pricing = calculator.calculateTotalPricing({
    studentCount: 1100,
    staffCount: 50,
    selectedModules: ['sms', 'transport'],
    smsCount: 1000,
    billingCycle: 'yearly',
    schoolType: 'regular'
});

console.log('Monthly Price:', pricing.totalPrice);
console.log('Yearly Price:', pricing.totalPrice * 12);
*/ 