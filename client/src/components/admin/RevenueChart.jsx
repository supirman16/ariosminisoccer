import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';

const RevenueChart = ({ data }) => {
    // Format data untuk Recharts
    const chartData = data.map(item => ({
        ...item,
        // Format tanggal agar lebih mudah dibaca di sumbu X
        date: moment(item.date).format('D MMM'),
    }));

    // Fungsi untuk memformat label tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-800 text-white p-2 rounded-md border border-gray-700">
                    <p className="label">{`${label}`}</p>
                    <p className="intro">Pendapatan: Rp {payload[0].value.toLocaleString('id-ID')}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                    <XAxis dataKey="date" tick={{ fill: '#a0aec0' }} />
                    <YAxis tickFormatter={(value) => `Rp${value/1000}k`} tick={{ fill: '#a0aec0' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255, 255, 255, 0.1)'}} />
                    <Legend />
                    <Bar dataKey="revenue" name="Pendapatan" fill="#facc15" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueChart;
