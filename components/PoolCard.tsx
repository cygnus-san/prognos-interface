import Link from 'next/link';
import { Pool } from '@/types';

interface PoolCardProps {
  pool: Pool;
}

export default function PoolCard({ pool }: PoolCardProps) {
  const isExpired = new Date(pool.deadline) < new Date();
  
  return (
    <div className="glass-card p-6 slide-up">
      {pool.image && (
        <div className="mb-6 relative overflow-hidden rounded-xl">
          <img 
            src={pool.image} 
            alt={pool.title} 
            className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      )}
      
      <div className="space-y-4">
        <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-500/30">
          {pool.tag}
        </span>
        
        <h3 className="text-xl font-bold text-white line-clamp-2 leading-tight">
          {pool.title}
        </h3>
        
        <p className="text-slate-300 line-clamp-3 leading-relaxed">
          {pool.description}
        </p>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">
            Deadline: {new Date(pool.deadline).toLocaleDateString()}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isExpired 
              ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
              : 'bg-green-500/20 text-green-300 border border-green-500/30'
          }`}>
            {isExpired ? 'Expired' : 'Active'}
          </span>
        </div>
        
        <div className="flex justify-between items-center pt-2">
          <div>
            <p className="text-sm text-slate-400">Total Stake</p>
            <p className="text-lg font-bold text-green-400">{pool.totalStake.toFixed(2)} STX</p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-slate-400">Predictions</p>
            <p className="text-lg font-bold text-blue-400">{pool._count.predictions}</p>
          </div>
        </div>
        
        <Link 
          href={`/pool/${pool.id}`}
          className="btn-primary block w-full text-center py-3 mt-6"
        >
          {isExpired ? 'View Results' : 'Vote'}
        </Link>
      </div>
    </div>
  );
}