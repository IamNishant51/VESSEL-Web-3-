export interface StakePoolInfo {
  name: string;
  mintAddress: string;
  apy: number;
  totalStaked: number;
  description: string;
}

export const LIQUID_STAKING_POOLS: StakePoolInfo[] = [
  {
    name: "Jito",
    mintAddress: "J1toso1uCk33JLFRP1N3kaZ1qL4qM2uq7i2jYqJ5qB",
    apy: 6.8,
    totalStaked: 2800000000,
    description: "Jito offers liquid staking with MEV rewards sharing",
  },
  {
    name: "Marinade",
    mintAddress: "mSoLzYCxHdYgGaU2zqE7J7rMmqTM2rY3v7Y3k1p7F8",
    apy: 7.2,
    totalStaked: 450000000,
    description: "Marinade Finance - pioneering liquid staking on Solana",
  },
  {
    name: "Solana Foundation",
    mintAddress: "CgnxSnBjg4pYw11Nbtdq3uJ4eMrG9r5W7Lk1fC4B3p",
    apy: 6.5,
    totalStaked: 52000000,
    description: "Official Solana staking through validators",
  },
];

export async function getLiquidStakingPools(): Promise<StakePoolInfo[]> {
  return LIQUID_STAKING_POOLS;
}

export async function getBestStakingPool(): Promise<StakePoolInfo> {
  return LIQUID_STAKING_POOLS.sort((a, b) => b.apy - a.apy)[0];
}

export function calculateStakeRewards(
  amountSOL: number,
  apy: number,
  days: number
): { rewards: number; total: number; apyPercent: number } {
  const dailyRate = apy / 100 / 365;
  const rewards = amountSOL * dailyRate * days;
  return {
    rewards,
    total: amountSOL + rewards,
    apyPercent: apy,
  };
}

export function estimateAPY(
  totalStaked: number,
  validatorCommissions: number[],
  mevRewards: number = 0
): number {
  const baseAPY = 5.5;
  const avgCommission = validatorCommissions.reduce((a, b) => a + b, 0) / validatorCommissions.length;
  return baseAPY * (1 - avgCommission / 100) + mevRewards;
}
