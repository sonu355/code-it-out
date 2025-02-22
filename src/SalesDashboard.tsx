import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';
import './SalesDashboard.css'

type SalesData = {
  id: number;
  product: string;
  date: string;
  sales: number;
  inventory: number;
  category: string;
  region: string;
};

type FormData = {
  product: string;
  date: string;
  sales: string;
  inventory: string;
  category: string;
  region: string;
};

interface DataItem {
  product: string;
  date: string;
  sales: number;
  inventory: number;
  category: string;
  region: string;
  id: number;
}

const initialData: SalesData[] = [
  { id: 1, product: "Laptop XZ-2000", date: "2024-01-01", sales: 1500, inventory: 32, category: "Electronics", region: "North" },
  { id: 2, product: "Smart Watch V3", date: "2024-01-02", sales: 900, inventory: 45, category: "Electronics", region: "East" },
  { id: 3, product: "Ergonomic Chair", date: "2024-01-03", sales: 2100, inventory: 18, category: "Furniture", region: "West" },
  { id: 4, product: "Wireless Earbuds", date: "2024-01-04", sales: 750, inventory: 55, category: "Electronics", region: "South" },
  { id: 5, product: "Office Desk", date: "2024-01-05", sales: 1200, inventory: 24, category: "Furniture", region: "North" },
  { id: 6, product: "Coffee Maker", date: "2024-01-06", sales: 600, inventory: 38, category: "Appliances", region: "East" },
  { id: 7, product: "Bluetooth Speaker", date: "2024-01-07", sales: 450, inventory: 62, category: "Electronics", region: "West" },
  { id: 8, product: "Standing Desk", date: "2024-01-08", sales: 1800, inventory: 15, category: "Furniture", region: "South" },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

type SortKey = 'product' | 'date' | 'sales' | 'inventory' | 'category' | 'region' | null;

const allCategories = ["Electronics", "Furniture", "Appliances", "Clothing", "Books"];
const allRegions = ["North", "South", "East", "West"];

type RegionData = {
  region: string;
  sales: number;
};

const SalesDashboard = () => {
  const [data, setData] = useState<SalesData[]>(initialData);
  const [formData, setFormData] = useState<FormData>({
    product: '',
    date: '',
    sales: '',
    inventory: '',
    category: '',
    region: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: 'ascending' | 'descending'}>({key: null, direction: 'ascending'});
  const [activeFilter, setActiveFilter] = useState('all');
  const [thresholdValue, setThresholdValue] = useState(1000);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [filteredSalesData, setFilteredSalesData] = useState<SalesData[]>(data);

  const handleDateRangeChange = () => {
    setFilteredSalesData(
      data.filter(item => {
        const itemDate = new Date(item.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return itemDate >= start && itemDate <= end;
      })
    );}

    const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSelectedCategories(prevState =>
        prevState.includes(value)
          ? prevState.filter(category => category !== value)
          : [...prevState, value]
      );
    };
  
    const handleRegionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSelectedRegions(prevState =>
        prevState.includes(value)
          ? prevState.filter(region => region !== value)
          : [...prevState, value]
      );
    };
  
    const applyFilters = () => {

      if (!startDate && !endDate && selectedCategories.length === 0 && selectedRegions.length === 0) {
        setFilteredSalesData([]);
        return;
      }

      const filtered = data.filter(item => {
        const matchesDate = (startDate && endDate)
          ? new Date(item.date) >= new Date(startDate) && new Date(item.date) <= new Date(endDate)
          : true;

        const matchesCategory = selectedCategories.length
          ? selectedCategories.includes(item.category)
          : true;
  
        const matchesRegion = selectedRegions.length
          ? selectedRegions.includes(item.region)
          : true;
  
        return matchesDate && matchesCategory && matchesRegion;
      });
  
      setFilteredSalesData(filtered);
    };
   
    useEffect(() => {
      applyFilters();
    }, [data, startDate, endDate, selectedCategories, selectedRegions]);    

  const getRegionData = () => {
    const regionMap: { [key: string]: number } = {};
    const regionData: RegionData[] = [];
    
    data.forEach(item => {
      if (regionMap[item.region]) {
        regionMap[item.region] += item.sales;
      } else {
        regionMap[item.region] = item.sales;               
      }
    });      
    Object.keys(regionMap).forEach(region => {
      regionData.push({
        region,
        sales: regionMap[region],
      })
    })  
    return regionData;
  };

  const totalSales = data.reduce((acc, curr) => acc + curr.sales, 0);
  const averageSales = data.length ? totalSales / data.length : 0;
  const bestSellingProduct = data.reduce((max, curr) => (curr.sales > max.sales ? curr : max), data[0]);
  const bestRegion = getRegionData().reduce((max, curr) => (curr.sales > max.sales ? curr : max), getRegionData()[0]);
  const [previousPeriodSales, setPreviousPeriodSales] = useState<number | null>(null);
  const [salesPerformance, setSalesPerformance] = useState<'increase' | 'decrease' | 'no-change'>('no-change');

  useEffect(() => {
    if (previousPeriodSales !== null) {
      if (totalSales > previousPeriodSales) {
        setSalesPerformance('increase');
      } else if (totalSales < previousPeriodSales) {
        setSalesPerformance('decrease');
      } else {
        setSalesPerformance('no-change');
      }
    }
    setPreviousPeriodSales(totalSales); 
  }, [totalSales]);


  const handleExportCSV = () => {
    const formatDate = (date: string | Date ): string => {
      let dateObj: Date
      if (typeof date === 'string') {
        dateObj = new Date(date);
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        return '';
      }
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const year = dateObj.getFullYear();
      return `${month}/${day}/${year}`;
    }
    const exportData = filteredData.map(item => ({
      product: item.product,
      date: formatDate(item.date),
      sales: item.sales,
      inventory: item.inventory,
      category: item.category,
      region: item.region,
    }));

    const headers = Object.keys(exportData[0]).join(',');
    const rows = exportData.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sales_data.csv';
    link.click();
  };

  const computeRegionSalesData = (): RegionData[] => {
    const regionMap: { [key: string]: number } = {};
    data.forEach(item => {
      if (regionMap[item.region]) {
        regionMap[item.region] += item.sales;
      } else {
        regionMap[item.region] = item.sales;
      }
    });
    const regionData: RegionData[] = [];
    Object.keys(regionMap).forEach(region => {
      regionData.push({ region, sales: regionMap[region] });
    });
    return regionData;
  };

  const getStackedBarData = (): { category: string; [region: string]: number | string }[] => {
    const result: { category: string; [region: string]: number | string }[] = [];
    allCategories.forEach(category => {
      const row: any = { category };
      allRegions.forEach(region => {
        row[region] = data
          .filter(item => item.category === category && item.region === region)
          .reduce((sum, item) => sum + item.sales, 0);
      });
      result.push(row);
    });
    return result;
  };

  const getMonthlyTrendData = (): { month: string; sales: number }[] => {
    const monthMap: { [key: string]: number } = {};
    data.forEach(item => {
      const dateObj = new Date(item.date);
      const monthYear = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap[monthYear]) {
        monthMap[monthYear] += item.sales;
      } else {
        monthMap[monthYear] = item.sales;
      }
    });
    const trendData = Object.keys(monthMap).map(month => ({ month, sales: monthMap[month] }));
    trendData.sort((a, b) => a.month.localeCompare(b.month));
    return trendData;
  };

  const regionData = computeRegionSalesData();
  const stackedBarData = getStackedBarData();
  const monthlyTrendData = getMonthlyTrendData();

  const deleteEntry = (id: number) => {
    const newData = data.filter((item) => item.id !== id);
    setData(newData);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const salesValue = Number(formData.sales);
    const inventoryValue = Number(formData.inventory);
    
    if (editingId) {
      const updatedData = data.map(item => 
        item.id === editingId ? 
        {...formData, sales: salesValue, inventory: inventoryValue, id: editingId} : 
        item
      );
      setData(updatedData);
      setEditingId(null);
    } else {
      const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1;
      setData([...data, {...formData, sales: salesValue, inventory: inventoryValue, id: newId}]);
    }
 
    setFormData({
      product: '',
      date: '',
      sales: '',
      inventory: '',
      category: '',
      region: ''
    });
  };

  const handleEdit = (item: SalesData) => {
    setFormData({
      product: item.product,
      date: item.date,
      sales: item.sales.toString(),
      inventory: item.inventory.toString(),
      category: item.category,
      region: item.region
    });
    setEditingId(item.id);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filter: 'all' | 'highSales' | 'lowSales' | 'lowInventory') => {
    setActiveFilter(filter);
  };

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThresholdValue(Number(e.target.value));
  };

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';;
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  const lineData = data.map((entry, index) => ({
    name: `Day ${index + 1}`,
    value: entry.sales
  }));

  const getCategoryData = () => {
    const categoryMap: { [key: string]: number} = {};
    data.forEach(item => {
      if (categoryMap[item.category]) {
        categoryMap[item.category] += item.sales;
      } else {
        categoryMap[item.category] = item.sales;
      }
    });
    
    return Object.keys(categoryMap).map(category => ({
      name: category,
      value: categoryMap[category]
    }));
  };

  let filteredData = data;
  
  if (activeFilter !== 'all') {
    if (activeFilter === 'highSales') {
      filteredData = data.filter(item => item.sales >= thresholdValue);
    } else if (activeFilter === 'lowSales') {
      filteredData = data.filter(item => item.sales < thresholdValue);
    } else if (activeFilter === 'lowInventory') {
      filteredData = data.filter(item => item.inventory < 30);
    }
  }
  
  if (searchTerm) {
    filteredData = filteredData.filter(item => 
      item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.region.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  if (sortConfig.key) {
    filteredData.sort((a, b) => {
      const key = sortConfig.key as keyof typeof a;
      if (a[key] < b[key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }


  return (
    <div className="sales-dashboard">
      <h1>Sales Dashboard</h1>
      <div className='content-section'>
     
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search products, categories, regions..." 
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="filter-controls">
          <button 
            className={activeFilter === 'all' ? 'active' : ''} 
            onClick={() => handleFilterChange('all')}
          >
            All Data
          </button>
          <button 
            className={activeFilter === 'highSales' ? 'active' : ''} 
            onClick={() => handleFilterChange('highSales')}
          >
            High Sales
          </button>
          <button 
            className={activeFilter === 'lowSales' ? 'active' : ''} 
            onClick={() => handleFilterChange('lowSales')}
          >
            Low Sales
          </button>
          <button 
            className={activeFilter === 'lowInventory' ? 'active' : ''} 
            onClick={() => handleFilterChange('lowInventory')}
          >
            Low Inventory
          </button>
          
          <label>
            Threshold: 
            <input 
              type="number" 
              value={thresholdValue} 
              onChange={handleThresholdChange}
              min="0"
            />
          </label>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="data-form">
      <h2>{editingId ? 'Edit Entry' : 'Add New Entry'}</h2>
      
      <div className="form-row">
        <div className="form-group">
          <label>Product</label>
          <input 
            type="text" 
            name="product" 
            value={formData.product} 
            onChange={handleChange} 
            required
          />
        </div>
        
        <div className="form-group">
          <label>Date</label>
          <input 
            type="date" 
            name="date" 
            value={formData.date} 
            onChange={handleChange} 
            required
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Sales ($)</label>
          <input 
            type="number" 
            name="sales" 
            value={formData.sales} 
            onChange={handleChange} 
            required
          />
        </div>
        
        <div className="form-group">
          <label>Inventory</label>
          <input 
            type="number" 
            name="inventory" 
            value={formData.inventory} 
            onChange={handleChange} 
            required
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Category</label>
          <select 
            name="category" 
            value={formData.category} 
            onChange={handleChange} 
            required
          >
            <option value="">Select a Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Appliances">Appliances</option>
            <option value="Clothing">Clothing</option>
            <option value="Books">Books</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Region</label>
          <select 
            name="region" 
            value={formData.region} 
            onChange={handleChange} 
            required
          >
            <option value="">Select a Region</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </select>
        </div>
      </div>
      
      <button type="submit">{editingId ? 'Update Entry' : 'Add Entry'}</button>
      {editingId && (
        <button type="button" onClick={() => {
          setEditingId(null);
          setFormData({
            product: '',
            date: '',
            sales: '',
            inventory: '',
            category: '',
            region: ''
          });
        }}>
          Cancel
        </button>
      )}
    </form>

    <div className="data-table-container">
      <h2>Sales Data</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th onClick={() => requestSort('product')}>
              Product {sortConfig.key === 'product' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </th>
            <th onClick={() => requestSort('date')}>
              Date {sortConfig.key === 'date' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </th>
            <th onClick={() => requestSort('sales')}>
              Sales ($) {sortConfig.key === 'sales' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </th>
            <th onClick={() => requestSort('inventory')}>
              Inventory {sortConfig.key === 'inventory' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </th>
            <th onClick={() => requestSort('category')}>
              Category {sortConfig.key === 'category' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </th>
            <th onClick={() => requestSort('region')}>
              Region {sortConfig.key === 'region' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((entry, index) => (
            <tr key={index} className={entry.sales >= thresholdValue ? 'high-sales' : ''}>
              <td>{entry.product}</td>
              <td>{entry.date}</td>
              <td>{entry.sales}</td>
              <td>{entry.inventory}</td>
              <td>{entry.category}</td>
              <td>{entry.region}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(entry)}>Edit</button>
        
                <button className="delete-btn" onClick={() => deleteEntry(entry.id)}>Delete</button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="summary-section">
      <div className="summary-item">
        <h3>Total Sales</h3>
        <p>${totalSales.toLocaleString()}</p>
      </div>
      <div className="summary-item">
        <h3>Average Sales</h3>
        <p>${averageSales.toFixed(2)}</p>
      </div>
      <div className="summary-item">
        <h3>Best Selling Product</h3>
        <p>{bestSellingProduct.product} (${bestSellingProduct.sales})</p>
      </div>
      <div className="summary-item">
        <h3>Best Region</h3>
        <p>{bestRegion.region} (${bestRegion.sales})</p>
      </div>

      <div className="performance-change">
        <h3 id='salesper'>Sales Performance</h3>
        <p className={`performance-indicator ${salesPerformance}`}>
          {salesPerformance === 'increase' && '📈 Sales Increased'}
          {salesPerformance === 'decrease' && '📉 Sales Decreased'}
          {salesPerformance === 'no-change' && '📊 No Change'}
        </p>
      </div>
    </div>
    <div className="export-buttons">
      <button onClick={handleExportCSV}>Export CSV</button>
    </div>
    <div className="filters">

    <div className="filter-item">
      <label>Start Date</label>
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <label>End Date</label>
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      <button onClick={handleDateRangeChange}>Apply Date Range Filter</button>
    </div>

    <div className="filter-item">
      <label>Categories</label>
      {allCategories.map((category) => (
        <div key={category}>
          <input
            type="checkbox"
            value={category}
            checked={selectedCategories.includes(category)}
            onChange={handleCategoryChange}
          />
          <label>{category}</label>
        </div>
      ))}
    </div>

    <div className="filter-item">
      <label>Regions</label>
      {allRegions.map((region) => (
        <div key={region}>
          <input
            type="checkbox"
            value={region}
            checked={selectedRegions.includes(region)}
            onChange={handleRegionChange}
          />
          <label>{region}</label>
        </div>
      ))}
    </div>
  </div>

  <div className="filter-summary">
  <h4>Applied Filters:</h4>
  <div>
    {startDate && endDate && <p>Date Range: {startDate} to {endDate}</p>}
    {selectedCategories.length > 0 && <p>Categories: {selectedCategories.join(', ')}</p>}
    {selectedRegions.length > 0 && <p>Regions: {selectedRegions.join(', ')}</p>}
  </div>
  </div>

      <div className="data-table-container">
        <h2>Sales Data</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Date</th>
              <th>Sales</th>
              <th>Inventory</th>
              <th>Category</th>
              <th>Region</th>
            </tr>
          </thead>
          <tbody>
            {filteredSalesData.map((entry, index) => (
              <tr key={index}>
                <td>{entry.product}</td>
                <td>{entry.date}</td>
                <td>{entry.sales}</td>
                <td>{entry.inventory}</td>
                <td>{entry.category}</td>
                <td>{entry.region}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <div className="charts-section">
        <h2>Data Visualization</h2>
        
        <div className="chart-container">
          <h3>Daily Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-container">
          <h3>Sales by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getCategoryData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-container">
          <h3>Sales by Region</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getRegionData()}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="sales"
                label
              >
                {getRegionData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="charts-section">
        <h2>Data Visualization Enhancements</h2>

        <div className="chart-container">
          <h3>Sales by Region</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={regionData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="sales"
                label
              >
                {regionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

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

    </div>
  );
};

export default SalesDashboard;