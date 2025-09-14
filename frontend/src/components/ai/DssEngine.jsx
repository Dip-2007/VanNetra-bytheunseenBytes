import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DssEngine = ({ user, mockData }) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('schemes');

  useEffect(() => {
    if (mockData) {
      // For admin, load all records
      // For regular user, show only their own record
      if (user.role === 'admin') {
        setAllRecords(mockData.fraRecords);
      } else if (user.role === 'user' && user.fraRecordId) {
        const userRecord = mockData.fraRecords.find(r => r.id === user.fraRecordId);
        if (userRecord) {
          setAllRecords([userRecord]);
          setSelectedRecord(userRecord); // Auto-select the user's record
        }
      }
    }
  }, [mockData, user]);

  // Generate recommendations when a record is selected
  useEffect(() => {
    if (selectedRecord) {
      setIsLoading(true);
      setAnalysisComplete(false);
      
      // Simulate AI processing
      setTimeout(() => {
        const schemes = generateSchemeRecommendations(selectedRecord);
        const interventions = generateInterventionRecommendations(selectedRecord);
        
        setRecommendations({
          schemes,
          interventions
        });
        
        setIsLoading(false);
        setAnalysisComplete(true);
      }, 2000);
    } else {
      setRecommendations([]);
      setAnalysisComplete(false);
    }
  }, [selectedRecord]);

  // Function to generate scheme recommendations based on selected record
  const generateSchemeRecommendations = (record) => {
    if (!record) return [];
    
    // Map of schemes and their eligibility logic
    const schemeMapping = {
      'SCH001': { // PM-KISAN
        eligible: record.claimType === 'Individual Forest Rights' && record.claimStatus === 'Approved',
        score: record.area > 1 ? 95 : 85,
        reason: record.area > 1 
          ? 'High priority: Approved individual forest right holder with substantial agricultural land'
          : 'Medium priority: Approved individual forest right holder with smaller land holding'
      },
      'SCH002': { // Jal Jeevan Mission
        eligible: true, // eligible for all
        score: record.village === 'Malkangiri' || record.village === 'Koraput' ? 98 : 80,
        reason: record.village === 'Malkangiri' || record.village === 'Koraput'
          ? 'Urgent: Located in water-scarce region with low groundwater levels'
          : 'Standard priority: All households eligible for functional tap connection'
      },
      'SCH003': { // MGNREGA
        eligible: record.claimStatus !== 'Rejected',
        score: record.claimType === 'Community Forest Rights' ? 75 : 85,
        reason: record.claimType === 'Community Forest Rights' 
          ? 'Community can benefit from employment guarantee scheme for forest conservation activities'
          : 'Individual can benefit from employment guarantee for land development'
      },
      'SCH004': { // Van Dhan Yojana
        eligible: record.claimType.includes('Community'),
        score: record.area > 10 ? 90 : 70,
        reason: record.area > 10
          ? 'High priority: Large community forest area suitable for sustainable harvesting'
          : 'Medium priority: Community forest with potential for value addition to forest produce'
      }
    };
    
    // Filter eligible schemes and add detailed information
    return mockData.schemes
      .filter(scheme => {
        const mapping = schemeMapping[scheme.id];
        return mapping && mapping.eligible;
      })
      .map(scheme => {
        const mapping = schemeMapping[scheme.id];
        return {
          ...scheme,
          matchScore: mapping.score,
          reason: mapping.reason
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore); // Sort by match score (descending)
  };
  
  // Function to generate intervention recommendations based on location and claim type
  const generateInterventionRecommendations = (record) => {
    if (!record) return [];
    
    const interventions = [];
    
    // Water-related interventions
    if (record.state === 'Odisha' || record.village === 'Malkangiri') {
      interventions.push({
        id: 'INT001',
        category: 'Water',
        name: 'Groundwater Recharging',
        description: 'Implement check dams and percolation tanks to increase groundwater levels',
        priority: 'High',
        reason: 'Low water table detected in satellite imagery for this region'
      });
    }
    
    // Forest conservation interventions
    if (record.claimType.includes('Community')) {
      interventions.push({
        id: 'INT002',
        category: 'Forestry',
        name: 'Sustainable Harvesting Training',
        description: 'Training program for sustainable harvesting of non-timber forest products',
        priority: 'Medium',
        reason: 'Community forest rights holders can benefit from sustainable use practices'
      });
    }
    
    // Agricultural interventions for individual claims
    if (record.claimType === 'Individual Forest Rights' && record.claimStatus === 'Approved') {
      interventions.push({
        id: 'INT003',
        category: 'Agriculture',
        name: 'Climate-Resilient Crop Varieties',
        description: 'Introduction to drought-resistant crop varieties suitable for forest fringe areas',
        priority: record.state === 'Maharashtra' ? 'High' : 'Medium',
        reason: 'Satellite data shows increasing drought patterns in this region'
      });
    }
    
    // Digital literacy intervention
    interventions.push({
      id: 'INT004',
      category: 'Education',
      name: 'Digital Literacy Program',
      description: 'Mobile-based training for accessing government schemes and market information',
      priority: 'Medium',
      reason: 'Improving digital access will enhance scheme implementation efficiency'
    });
    
    // Sort by priority
    return interventions.sort((a, b) => {
      const priorityMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return priorityMap[b.priority] - priorityMap[a.priority];
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-green-200 to-blue-200 min-h-screen min-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Decision Support System</h1>
          <p className="text-gray-600 mt-1">
            AI-powered recommendations for FRA implementation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Selection Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2.4rem] shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Select FRA Record</h2>
            
            {user.role === 'admin' ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-2">Select a claim to analyze:</p>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {allRecords.map(record => (
                    <div 
                      key={record.id} 
                      onClick={() => setSelectedRecord(record)}
                      className={`p-3 rounded-md cursor-pointer border ${
                        selectedRecord?.id === record.id 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{record.name}</div>
                      <div className="text-sm text-gray-600">{record.village}, {record.district}</div>
                      <div className="text-sm mt-1">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          record.claimStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                          record.claimStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.claimStatus}
                        </span>
                        <span className="ml-2 text-gray-500">{record.claimType}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedRecord ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-medium text-gray-800">{selectedRecord.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedRecord.village}, {selectedRecord.district}</p>
                    <div className="mt-2 flex items-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        selectedRecord.claimStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                        selectedRecord.claimStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedRecord.claimStatus}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">{selectedRecord.area} hectares</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No FRA record found for your account.</p>
                )}

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Legend</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center">
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                      <span>High Priority (90-100)</span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                      <span>Medium Priority (70-89)</span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                      <span>Low Priority (below 70)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations Panel */}
        <div className="lg:col-span-3">
          {!selectedRecord ? (
            <div className="bg-white rounded-[2.4rem] shadow p-6 flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg">Select a FRA record to view AI recommendations</p>
                <p className="text-sm mt-2">The system will analyze the record and suggest suitable schemes and interventions</p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="bg-white rounded-[2.4rem] shadow p-6 flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg text-gray-700">AI Engine processing...</p>
                <p className="text-sm text-gray-500 mt-2">Analyzing claim data and matching with eligible schemes</p>
              </div>
            </div>
          ) : analysisComplete ? (
            <div className="bg-white rounded-[2.4rem] shadow">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    className={`py-4 px-6 text-center border-b-2 font-medium ${
                      activeTab === 'schemes'
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('schemes')}
                  >
                    Scheme Recommendations
                  </button>
                  <button
                    className={`py-4 px-6 text-center border-b-2 font-medium ${
                      activeTab === 'interventions'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('interventions')}
                  >
                    Intervention Suggestions
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'schemes' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Eligible Government Schemes
                      </h3>
                      {user.role === 'admin' && (
                        <button className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md">
                          Export Report
                        </button>
                      )}
                    </div>
                    
                    {recommendations.schemes && recommendations.schemes.length > 0 ? (
                      <div className="space-y-4">
                        {recommendations.schemes.map((scheme) => (
                          <div key={scheme.id} className="border border-gray-300 rounded-[2.4rem] p-4">
                            <div className="flex justify-between">
                              <h4 className="font-bold text-gray-800">{scheme.name}</h4>
                              <div className="flex items-center">
                                <span className="text-sm font-medium mr-2">Match:</span>
                                <div className="w-12 h-3 bg-gray-500 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${
                                      scheme.matchScore >= 90 ? 'bg-green-500' :
                                      scheme.matchScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${scheme.matchScore}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-sm">{scheme.matchScore}%</span>
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm font-medium mt-2">{scheme.description}</p>
                            <div className="mt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                              <p className="text-sm text-gray-600">
                                <span className="font-bold">Benefits:</span> {scheme.benefits}
                              </p>
                              {user.role === 'admin' && (
                                <button className="mt-2 sm:mt-0 text-sm text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded">
                                  Notify Beneficiary
                                </button>
                              )}
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-sm text-gray-600">
                                <span className="font-bold">AI Reasoning:</span> {scheme.reason}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-gray-500">
                        <p>No eligible schemes found for this claim.</p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'interventions' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Suggested Interventions
                      </h3>
                      {user.role === 'admin' && (
                        <button className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md">
                          Action Plan
                        </button>
                      )}
                    </div>
                    
                    {recommendations.interventions && recommendations.interventions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendations.interventions.map((intervention) => (
                          <div key={intervention.id} className="border border-gray-300 rounded-[2.4rem] p-4">
                            <div className="flex items-start">
                              <div className={`mt-0.5 p-1 rounded-md ${
                                intervention.category === 'Water' ? 'bg-blue-100' :
                                intervention.category === 'Forestry' ? 'bg-green-100' :
                                intervention.category === 'Agriculture' ? 'bg-yellow-100' : 'bg-purple-100'
                              }`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${
                                  intervention.category === 'Water' ? 'text-blue-600' :
                                  intervention.category === 'Forestry' ? 'text-green-600' :
                                  intervention.category === 'Agriculture' ? 'text-yellow-600' : 'text-purple-600'
                                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  {intervention.category === 'Water' && (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2h4l10 5z" />
                                  )}
                                  {intervention.category === 'Forestry' && (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                  )}
                                  {intervention.category === 'Agriculture' && (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  )}
                                  {intervention.category === 'Education' && (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                  )}
                                </svg>
                              </div>
                              <div className="ml-3">
                                <div className="flex items-center">
                                  <h4 className="font-medium text-gray-800">{intervention.name}</h4>
                                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                    intervention.priority === 'High' ? 'bg-red-100 text-red-800' :
                                    intervention.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {intervention.priority} Priority
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{intervention.description}</p>
                                <p className="text-xs text-gray-500 mt-2 italic">{intervention.reason}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-gray-500">
                        <p>No intervention suggestions found for this claim.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center text-gray-500">
                <p>Something went wrong with the analysis. Please try again.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DssEngine;