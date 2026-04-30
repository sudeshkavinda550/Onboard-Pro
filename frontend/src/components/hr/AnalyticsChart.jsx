import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const AnalyticsChart = ({ type, data, title, options = {} }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  const chartOptions = { ...defaultOptions, ...options };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar options={chartOptions} data={data} />;
      case 'pie':
        return <Pie options={chartOptions} data={data} />;
      case 'line':
        return <Line options={chartOptions} data={data} />;
      default:
        return <Bar options={chartOptions} data={data} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div style={{ height: '300px' }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default AnalyticsChart;