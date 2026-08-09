export interface ExpansionReadinessScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: {
    financialHealth: number;
    brandSaturation: number;
    operations: number;
    leadership: number;
  };
  recommendations: string[];
}

export class ExpansionIntelligenceEngine {
  /**
   * Calculates a readiness score based on tenant historical data.
   * In production, this would query Supabase for actual P&L and lead volume.
   */
  static async calculateReadinessScore(businessId: string): Promise<ExpansionReadinessScore> {
    // Stub implementation
    return {
      score: 87,
      grade: 'A',
      factors: {
        financialHealth: 92,
        brandSaturation: 85,
        operations: 78,
        leadership: 90,
      },
      recommendations: [
        'Digitize remaining paper checklists into VowOS Operations',
        'Begin interviewing regional managers',
        'Review Market Explorer for high-income ZIP codes'
      ]
    };
  }

  /**
   * Generates a pro forma P&L for a new location
   */
  static generateProForma(
    marketSize: number, 
    competitors: number, 
    initialInvestment: number
  ) {
    const baseSales = 1200000;
    const marketMultiplier = marketSize > 1000000 ? 1.2 : 0.9;
    const competitionPenalty = competitors > 20 ? 0.85 : 1.0;
    
    const projectedSales = baseSales * marketMultiplier * competitionPenalty;
    const netIncome = projectedSales * 0.15; // 15% net margin
    
    return {
      projectedSales,
      netIncome,
      roi: (netIncome / initialInvestment) * 100,
      paybackPeriod: initialInvestment / netIncome
    };
  }
}
