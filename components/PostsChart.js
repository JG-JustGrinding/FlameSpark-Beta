'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
import { Line } from 'react-chartjs-2';
import { supabase } from '@/lib/supabaseClient';

export default function PostsChart({ projectId, className = '' }) {
  const [range, setRange] = useState('week'); // 'today', 'week', 'month'
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const ranges = [{filter: "week", text: "Past Week"}, {filter: "month", text: "Past Month"}, {filter: "year", text: "Past Year"}];
  const labelStepRef = useRef(1);

  const fetchData = async () => {
    const { data, error } = await supabase.rpc('get_project_post_counts', {
      p_project_id: projectId,
      range: range
    });

    if (error) {
      console.log('Error fetching post counts:', error);
      return;
    }

    const labels = data?.map(d => d.label);
    const counts = data?.map(d => d.count);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Posts',
          data: counts,
          fill: false,
          borderColor: '#EB5036',
          backgroundColor: 'rgba(184, 184, 184, 0.2)',
          tension: 0.1
        }
      ]
    });
  };

  useEffect(() => {
    if (!projectId)
    {
        return;
    }

    fetchData();
  }, [range, projectId]);

  const updateLabelStep = () => {
    if (window.innerWidth < 400) labelStepRef.current = 4;
    else if (window.innerWidth < 600) labelStepRef.current = 3;
    else if (window.innerWidth < 800) labelStepRef.current = 2;
    else labelStepRef.current = 1;
  };

  useEffect(() => {
    updateLabelStep();
    window.addEventListener('resize', updateLabelStep);
    return () => window.removeEventListener('resize', updateLabelStep);
  }, []);

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top', font: {family: 'Lato',}  },
            title: { display: true, text: 'Posts Over Time',
                font: {
                    family: 'Lato',
                    size: 18,
                    weight: '700'
                } 
            }
        },
        scales: {
            y: {
            ticks: {
                font: {
                    family: 'Montserrat',
                    size: 11,
                    weight: '600'
                },
                // Only show whole numbers >= 0
                callback: function(value) {
                if (value < 0) return '';           // hide negatives
                if (!Number.isInteger(value)) return ''; // hide non-whole numbers
                return value;                       // show valid numbers
                }
            }
            },
            x: {
                ticks: {
                    font: {
                        family: 'Montserrat',
                        size: 11,
                        weight: '600'
                    },
                    callback: function(value, index) {
                    // Show only every 3rd label for monthly chart
                    return (range === 'month' && index % labelStepRef.current !== 0) ? '' : this.getLabelForValue(value);
                    }
                }
            }
        }
    };

  return (
    <div className={`project-posts-chart ${className}`}>
      <Line data={chartData} options={options} />
      <div className="chart-controls" style={{ marginBottom: '1rem' }}>
        {ranges.map(r => (
          <button
            key={r.filter}
            onClick={() => setRange(r.filter)}
            style={{
              marginRight: '0.5rem',
              marginTop: '0.5rem',
              background: range === r.filter ? 'var(--flamespark-red)' : 'var(--white)',
              color: range === r.filter ? 'var(--white)' : 'var(--black)',
              border: 'none',
            }}
            className='button-shape bodyFont'
          >
            {r.text}
          </button>
        ))}
      </div>
    </div>
  );
}