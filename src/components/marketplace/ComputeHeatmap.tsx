'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Activity } from 'lucide-react';

interface RegionData {
  name: string;
  availability: number;
  gpuCount: number;
  pricePerHour: number;
  status: 'optimal' | 'busy' | 'critical';
}

const regions: string[] = ['US-West', 'US-East', 'EU-West', 'EU-East', 'Asia-SE', 'Asia-E', 'AU', 'ME'];

export default function ComputeHeatmap() {
  const [data, setData] = useState<RegionData[]>([]);

  useEffect(() => {
    const updateData = () => {
      setData(
        regions.map((name) => {
          const availability = Math.random() * 100;
          return {
            name,
            availability,
            gpuCount: Math.floor(Math.random() * 50) + 10,
            pricePerHour: Math.random() * 3 + 1,
            status: availability > 70 ? 'optimal' : availability > 30 ? 'busy' : 'critical',
          };
        })
      );
    };

    updateData();
    const timer = setInterval(updateData, 8000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: RegionData['status']) => {
    if (status === 'optimal') return 'text-emerald-500';
    if (status === 'busy') return 'text-amber-500';
    return 'text-rose-500';
  };

  const getStatusBg = (status: RegionData['status']) => {
    if (status === 'optimal') return 'bg-emerald-500';
    if (status === 'busy') return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Activity size={16} className="text-purple-500" />
          Global GPU Availability
        </h3>
        <div className="flex gap-3">
          {['optimal', 'busy', 'critical'].map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${getStatusBg(s as any)}`} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {data.map((region, idx) => (
          <motion.div
            key={region.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex-shrink-0 w-40 p-3 rounded-xl bg-white/40 backdrop-blur-md border border-white/60 shadow-sm hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-800">{region.name}</span>
              <Cpu size={12} className="text-slate-400 group-hover:text-purple-500 transition-colors" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <span className={`text-lg font-black leading-none ${getStatusColor(region.status)}`}>
                  {region.availability.toFixed(0)}%
                </span>
                <span className="text-[10px] font-bold text-slate-400">${region.pricePerHour.toFixed(2)}/hr</span>
              </div>

              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${region.availability}%` }}
                  className={`h-full ${getStatusBg(region.status)}`}
                />
              </div>

              <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase">
                <span>{region.gpuCount} Nodes</span>
                <Zap size={10} className={region.availability > 50 ? 'text-amber-400' : 'text-slate-300'} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
