import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { RegionData } from './SalesDashboard';

type Props = {
  regionData: RegionData[];
  stackedBarData: { category: string; [region: string]: number | string }[];
  monthlyTrendData: { month: string; sales: number }[];
  dailyTrendData: { date: string; sales: number }[];  // Added daily trend data prop
  allRegions: string[];
  COLORS: string[];
};

const ChartsSection: React.FC<Props> = ({ regionData, stackedBarData, monthlyTrendData, dailyTrendData, allRegions, COLORS }) => {
  return (
    <div className="charts-section">
      <h2>Data Visualization Enhancements</h2>

      {/* Sales by Region Pie Chart */}
      <div className="chart-container">
        <h3>Sales by Region</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={regionData} cx="50%" cy="50%" outerRadius={100} dataKey="sales" label>
              {regionData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category/Region Comparison Stacked Bar Chart */}
      <div className="chart-container">
        <h3>Category/Region Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stackedBarData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            {allRegions.map((region, index) => (
              <Bar key={region} dataKey={region} stackId="a" fill={COLORS[index % COLORS.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

       {/* Daily Sales Trend Line Chart */}
       <div className="chart-container">
        <h3>Daily Sales Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#82ca9d" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Trend Line Chart */}
      <div className="chart-container">
        <h3>Monthly Trend Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

     
    </div>
  );
};

export default ChartsSection;
