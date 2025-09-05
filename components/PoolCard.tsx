import Link from 'next/link';
import { Pool } from '@/types';

interface PoolCardProps {
  pool: Pool;
}

export default function PoolCard({ pool }: PoolCardProps) {
  const isExpired = new Date(pool.deadline) < new Date();
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {pool.image && (
        <img 
          src={pool.image} 
          alt={pool.title} 
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}
      
      <div className="space-y-3">
        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
          {pool.tag}
        </span>
        
        <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
          {pool.title}
        </h3>
        
        <p className="text-gray-600 line-clamp-3">
          {pool.description}
        </p>
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>
            Deadline: {new Date(pool.deadline).toLocaleDateString()}
          </span>
          <span className={isExpired ? 'text-red-500' : 'text-green-500'}>
            {isExpired ? 'Expired' : 'Active'}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Total Stake</p>
            <p className="text-lg font-bold text-green-600">${pool.totalStake.toFixed(2)}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Predictions</p>
            <p className="text-lg font-bold text-blue-600">{pool._count.predictions}</p>
          </div>
        </div>
        
        <Link 
          href={`/pool/${pool.id}`}
          className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isExpired ? 'View Results' : 'Vote'}
        </Link>
      </div>
    </div>
  );
}