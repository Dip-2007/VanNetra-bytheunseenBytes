import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

const Dashboard = ({ user, mockData }) => {
    const [stats, setStats] = useState(null);
    const [userRecord, setUserRecord] = useState(null);
    const [recommendedSchemes, setRecommendedSchemes] = useState([]);

    useEffect(() => {
        if (mockData) {
            // Calculate dashboard statistics
            const approvedClaims = mockData.fraRecords.filter(r => r.claimStatus === 'Approved').length;
            const pendingClaims = mockData.fraRecords.filter(r => r.claimStatus === 'Pending').length;
            const rejectedClaims = mockData.fraRecords.filter(r => r.claimStatus === 'Rejected').length;

            const individualClaims = mockData.fraRecords.filter(r => r.claimType === 'Individual Forest Rights').length;
            const communityClaims = mockData.fraRecords.filter(r => r.claimType.includes('Community')).length;

            const totalArea = mockData.fraRecords.reduce((sum, record) => sum + record.area, 0);

            setStats({
                totalClaims: mockData.fraRecords.length,
                approvedClaims,
                pendingClaims,
                rejectedClaims,
                individualClaims,
                communityClaims,
                totalArea: totalArea.toFixed(2)
            });

            // If user is a beneficiary, find their record
            if (user.role === 'user' && user.fraRecordId) {
                const record = mockData.fraRecords.find(r => r.id === user.fraRecordId);
                setUserRecord(record);

                // Generate recommended schemes based on user record
                if (record) {
                    const recommendations = mockData.schemes.filter(scheme => {
                        if (scheme.id === 'SCH001' && record.claimType === 'Individual Forest Rights') return true;
                        if (scheme.id === 'SCH002') return true;
                        if (scheme.id === 'SCH003') return true;
                        if (scheme.id === 'SCH004' && record.claimType.includes('Community')) return true;
                        return false;
                    });

                    setRecommendedSchemes(recommendations);
                }
            }
        }
    }, [mockData, user]);

    // Enhanced color palettes for charts
    const statusColors = ['#22C55E', '#F59E0B', '#EF4444']; // Tailwind green, amber, red
    const typeColors = ['#1D4ED8', '#8B5CF6']; // Tailwind blue, purple

    // Chart data for claim status
    const statusChartData = {
        labels: ['Approved', 'Pending', 'Rejected'],
        datasets: [
            {
                data: stats ? [stats.approvedClaims, stats.pendingClaims, stats.rejectedClaims] : [],
                backgroundColor: statusColors,
                borderColor: '#ffffff', // White border for slices
                borderWidth: 2,
                hoverOffset: 12, // New hover effect
            },
        ],
    };

    // Pie chart options for better styling
    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%', // Creates a doughnut chart
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#374151',
                    font: {
                        size: 14,
                    },
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                bodyFont: {
                    size: 14,
                },
                padding: 10,
                borderColor: '#E5E7EB',
                borderWidth: 1,
            },
        },
    };

    // Chart data for claim types
    const typeChartData = {
        labels: ['Individual Claims', 'Community Claims'],
        datasets: [
            {
                data: stats ? [stats.individualClaims, stats.communityClaims] : [],
                backgroundColor: typeColors,
                borderColor: '#ffffff', // White border for slices
                borderWidth: 2,
                hoverOffset: 12, // New hover effect
            },
        ],
    };

    // Bar chart data for state distribution
    const stateDistribution = mockData?.fraRecords.reduce((acc, record) => {
        acc[record.state] = (acc[record.state] || 0) + 1;
        return acc;
    }, {});

    const stateChartData = {
        labels: stateDistribution ? Object.keys(stateDistribution) : [],
        datasets: [
            {
                label: 'Number of Claims',
                data: stateDistribution ? Object.values(stateDistribution) : [],
                backgroundColor: '#10B981',
                borderColor: '#047857',
                borderWidth: 1,
                borderRadius: 5, // Rounded corners for bars
                hoverBackgroundColor: '#059669',
            }
        ]
    };

    // Bar chart options
    const stateChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#374151',
                    font: {
                        size: 14,
                    },
                }
            },
            title: {
                display: true,
                text: 'Claims by State',
                color: '#1F2937',
                font: {
                    size: 18,
                    weight: 'bold',
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                bodyFont: {
                    size: 14,
                },
                padding: 10,
                borderColor: '#E5E7EB',
                borderWidth: 1,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#4B5563',
                },
                grid: {
                    color: '#E5E7EB',
                }
            },
            x: {
                ticks: {
                    color: '#4B5563',
                },
                grid: {
                    display: false,
                }
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-green-200 to-blue-200 min-h-screen min-w-full">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {user.role === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {user.role === 'admin'
                            ? 'Monitor and manage FRA implementation progress'
                            : `Welcome, ${user.name}. View your forest rights claims and eligible schemes`}
                    </p>
                </div>
                <div className="mt-4 md:mt-0">
                    <Link
                        to="/map"
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-[2.4rem] inline-flex items-center transition-colors duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12 1.586l-4 4H2a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V7.586l-4-4H12zM6 7h8v7H6V7z" clipRule="evenodd" />
                        </svg>
                        View FRA Atlas
                    </Link>
                </div>
            </div>

            {/* Admin Dashboard */}
            {user.role === 'admin' && stats && (
                <div className="space-y-8">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-[2.4rem] shadow-md p-6 border-2 border-green-600 transition-shadow duration-300 hover:shadow-lg">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-green-100 text-green-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Total Claims</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.totalClaims}</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <p>Approved: <span className="font-semibold text-green-600">{stats.approvedClaims}</span></p>
                                    <p>Pending: <span className="font-semibold text-amber-600">{stats.pendingClaims}</span></p>
                                    <p>Rejected: <span className="font-semibold text-red-600">{stats.rejectedClaims}</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.4rem] shadow-md p-6 border-2 border-blue-600 transition-shadow duration-300 hover:shadow-lg">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Beneficiary Types</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.individualClaims + stats.communityClaims}</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <p>Individual: <span className="font-semibold text-blue-600">{stats.individualClaims}</span></p>
                                    <p>Community: <span className="font-semibold text-purple-600">{stats.communityClaims}</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.4rem] shadow-md p-6 border-2 border-green-600 transition-shadow duration-300 hover:shadow-lg">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-green-100 text-green-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Total Land Area</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.totalArea} ha</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <Link to="/map" className="text-green-600 hover:text-green-700 text-sm font-medium">
                                    View details in FRA Atlas →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white rounded-[2.4rem] shadow-md p-6 border-0 border-grey-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Claims by Status</h3>
                            <div className="h-64">
                                <Pie data={statusChartData} options={pieChartOptions} />
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.4rem] shadow-md p-6 border-0 border-grey-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Claims by Type</h3>
                            <div className="h-64">
                                <Pie data={typeChartData} options={pieChartOptions} />
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.4rem] shadow-md p-6 border-0 border-grey-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Geographic Distribution</h3>
                            <div className="h-64">
                                <Bar data={stateChartData} options={stateChartOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-[2.4rem] shadow-md p-6 border-0 border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link to="/ocr" className="bg-green-100 hover:bg-green-200 p-4 rounded-[1.4rem] flex items-center transition-colors duration-300">
                                <div className="bg-green-100 p-2 rounded-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="ml-3 rounded-[2.4rem]">
                                    <p className="font-medium text-gray-800">Process FRA Documents</p>
                                    <p className="text-sm text-gray-500">OCR & NLP processing</p>
                                </div>
                            </Link>

                            <Link to="/map" className="bg-blue-100 hover:bg-blue-200 p-4 rounded-[1.4rem] flex items-center transition-colors duration-300">
                                <div className="bg-blue-100 p-2 rounded-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="font-medium text-gray-800">FRA Atlas</p>
                                    <p className="text-sm text-gray-500">Interactive WebGIS map</p>
                                </div>
                            </Link>

                            <Link to="/dss" className="bg-purple-100 hover:bg-purple-200 p-4 rounded-[1.4rem] flex items-center transition-colors duration-300">
                                <div className="bg-purple-100 p-2 rounded-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="font-medium text-gray-800">Decision Support</p>
                                    <p className="text-sm text-gray-500">AI-powered recommendations</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* User Dashboard */}
            {user.role === 'user' && userRecord && (
                <div className="space-y-8">
                    {/* User's Claim Card */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                        <div className={`px-6 py-4 ${userRecord.claimStatus === 'Approved' ? 'bg-green-600' :
                            userRecord.claimStatus === 'Pending' ? 'bg-amber-500' : 'bg-red-600'
                            } text-white`}>
                            <h3 className="text-xl font-semibold">Your Forest Rights Claim</h3>
                            <p className="text-sm opacity-90">Claim ID: {userRecord.id}</p>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Claim Type</h4>
                                    <p className="text-lg font-medium text-gray-800">{userRecord.claimType}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                    <p className={`text-lg font-bold ${userRecord.claimStatus === 'Approved' ? 'text-green-600' :
                                        userRecord.claimStatus === 'Pending' ? 'text-amber-600' : 'text-red-600'
                                        }`}>
                                        {userRecord.claimStatus}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Location</h4>
                                    <p className="text-lg font-medium text-gray-800">{userRecord.village}, {userRecord.district}, {userRecord.state}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Land Area</h4>
                                    <p className="text-lg font-medium text-gray-800">{userRecord.area} hectares</p>
                                </div>
                            </div>

                            {userRecord.approvalDate && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Approved on:</span> {userRecord.approvalDate}
                                    </p>
                                </div>
                            )}

                            <div className="mt-4">
                                <Link to="/map" className="text-green-600 hover:text-green-700 text-sm font-medium inline-flex items-center">
                                    View your land in FRA Atlas
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Eligible Schemes */}
                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Eligible Schemes</h3>

                        {recommendedSchemes.length > 0 ? (
                            <div className="space-y-4">
                                {recommendedSchemes.map(scheme => (
                                    <div key={scheme.id} className="border border-gray-200 rounded-lg p-4 transition-colors duration-300 hover:border-green-400">
                                        <h4 className="font-semibold text-gray-800">{scheme.name}</h4>
                                        <p className="text-gray-600 mt-1">{scheme.description}</p>
                                        <div className="mt-3 flex flex-col sm:flex-row sm:justify-between">
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium text-gray-700">Benefits:</span> {scheme.benefits}
                                            </div>
                                            <Link to="/dss" className="mt-2 sm:mt-0 text-green-600 hover:text-green-700 text-sm font-medium">
                                                Check eligibility details →
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600">No eligible schemes found. Please check back later.</p>
                        )}
                    </div>
                </div>
            )}
            
            {/* Floating Chatbot Icon */}
<Link
  to="/chatbot"
  className="fixed bottom-6 right-6 text-white p-3 rounded-full shadow-lg transition-transform transform hover:scale-110 bg-gradient-to-r from-green-400 to-blue-400"
>
  <img 
    src="https://iili.io/KuXJGet.png" 
    alt="Chatbot Icon" 
    className="h-11 w-11"
  />
</Link>


        </div>
    );
};

export default Dashboard;