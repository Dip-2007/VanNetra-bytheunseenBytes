import { useState } from 'react';

const OcrProcessor = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processedText, setProcessedText] = useState('');
  const [extractedEntities, setExtractedEntities] = useState(null);
  const [activeTab, setActiveTab] = useState('ocr');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'image/jpeg' || selectedFile.type === 'image/png' || selectedFile.type === 'application/pdf')) {
      setFile(selectedFile);
      
      // Create preview URL for images
      if (selectedFile.type.includes('image')) {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          setPreviewUrl(fileReader.result);
        };
        fileReader.readAsDataURL(selectedFile);
      } else {
        // For PDFs, use a placeholder. The path was incorrect.
        setPreviewUrl('/images/PDFDocument.jpg');
      }
      
      // Reset results
      setProcessedText('');
      setExtractedEntities(null);
      // Reset to the default tab
      setActiveTab('ocr');
    }
  };

  const processOCR = () => {
    if (!file) return;
    
    setProcessing(true);
    
    // Simulate OCR processing with a timeout
    setTimeout(() => {
      // Mock OCR result based on file name
      let mockResult = '';
      
      if (file.name.toLowerCase().includes('fra')) {
        mockResult = `FORM - B
FOREST RIGHTS ACT, 2006
[See Rule 6(1)]

CLAIM FORM FOR RIGHTS TO FOREST LAND
[To be filled by the Claimant(s)]

1. Name of the Claimant (Husband/Wife): RAMESH KUMAR
2. Name of Father/Husband: SURESH KUMAR
3. Name of Village/Gram Sabha: ADIVASI NAGAR
4. Gram Panchayat: JUNGLE PANCHAYAT
5. Tehsil/Taluka: CENTRAL
6. District: GADCHIROLI
7. State: MAHARASHTRA

(a) Scheduled Tribe: YES / NO
(b) Other Traditional Forest Dweller: YES / NO
(c) Primitive Tribal Group: YES / NO

8. Area of forest land claimed:
(a) for individual occupation: 1.5 hectares
(b) for community rights: N/A

9. Description of claimed forest land:
PLOT LOCATED IN SOUTH-EASTERN SECTION OF RESERVED FOREST AREA, BORDERING AGRICULTURAL LAND, CONTAINING APPROXIMATELY 25 TREES

10. CLAIM STATUS: APPROVED on 12/05/2018
APPROVAL NUMBER: IFR/MH/GC/2018/034

Signature/Thumb Impression of the Claimant(s): [THUMB PRINT]`;
      } else if (file.name.toLowerCase().includes('community')) {
        mockResult = `FORM – C
FOREST RIGHTS ACT, 2006
[See Rule 11(1)(a)]

COMMUNITY RIGHTS CLAIM FORM
[To be filled by the Village Assembly]

1. Name of Village/Community: TRIBAL COMMUNITY COUNCIL
2. Gram Sabha: DANTEWADA
3. Panchayat: SOUTH PANCHAYAT
4. Tehsil/Taluka: CENTRAL
5. District: DANTEWADA
6. State: CHHATTISGARH

Type of Community Claim: Community Forest Rights (CFR)

7. Description of the Community Forest traditionally accessed:
ENTIRE FOREST AREA SURROUNDING DANTEWADA VILLAGE, APPROXIMATELY 12.7 HECTARES, USED FOR COLLECTION OF MINOR FOREST PRODUCE, GRAZING, CULTURAL PRACTICES

8. Traditional access routes and places of cultural/religious significance:
EASTERN PATH TO SACRED HILL, WESTERN ROUTE TO WATER SOURCE, NORTHERN PATH TO ANCESTRAL GROUNDS

9. Grounds for Claim:
COMMUNITY HAS BEEN TRADITIONALLY USING THIS FOREST AREA FOR OVER 75 YEARS FOR LIVELIHOOD AND CULTURAL PURPOSES

10. CLAIM STATUS: PENDING
SUBMISSION DATE: 15/02/2023
REFERENCE NUMBER: CFR/CG/DT/2023/007

Signature/Thumb Impression of three eldest members of Gram Sabha: [SIGNATURES]
Counter Signed by Forest Rights Committee: [SIGNATURES]`;
      } else {
        mockResult = `[Unable to extract text from document. Please ensure document contains clear text and try again.]`;
      }
      
      setProcessedText(mockResult);
      
      // Simulate NER extraction
      if (mockResult !== '' && !mockResult.includes('Unable to extract text')) {
        const mockEntities = extractEntitiesFromText(mockResult);
        setExtractedEntities(mockEntities);
      } else {
        setExtractedEntities(null); // Clear entities if OCR failed
      }
      
      setProcessing(false);
    }, 3000);
  };
  
  // Simulated NER function
  const extractEntitiesFromText = (text) => {
    // This is a mock implementation of NER
    // In a real application, this would use a trained NLP model
    
    const entities = {
      names: [],
      locations: [],
      dates: [],
      claimInfo: {}
    };
    
    // Extract names (look for patterns like "Name: X" or all caps words)
    const nameMatches = text.match(/(?:Name[^:]*:|NAME[^:]*:)\s*([A-Z\s]+)/g);
    if (nameMatches) {
      nameMatches.forEach(match => {
        const name = match.split(':')[1].trim();
        if (name && !entities.names.includes(name)) {
          entities.names.push(name);
        }
      });
    }
    
    // Look for all-caps names
    const allCapsNames = text.match(/\b[A-Z]{2,}(?:\s+[A-Z]{2,})*\b/g);
    if (allCapsNames) {
      allCapsNames.forEach(name => {
        if (!entities.names.includes(name) && name.length > 3 && !name.match(/^(YES|NO|N\/A)$/)) {
          entities.names.push(name);
        }
      });
    }
    
    // Extract locations (look for common location terms)
    const locationKeywords = ['Village', 'District', 'State', 'Panchayat', 'Tehsil', 'Taluka', 'Gram Sabha'];
    locationKeywords.forEach(keyword => {
      const regex = new RegExp(`${keyword}[^:]*:\\s*([A-Za-z\\s]+)`, 'g');
      const matches = [...text.matchAll(regex)];
      matches.forEach(match => {
        if (match[1] && match[1].trim() !== '') {
          entities.locations.push({
            type: keyword,
            name: match[1].trim()
          });
        }
      });
    });
    
    // Extract dates
    const dateMatches = text.match(/\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/g);
    if (dateMatches) {
      entities.dates = dateMatches;
    }
    
    // Extract claim specific information
    if (text.includes('CLAIM STATUS:')) {
      const statusMatch = text.match(/CLAIM STATUS:\s*([A-Z]+)/);
      if (statusMatch) {
        entities.claimInfo.status = statusMatch[1];
      }
    }
    
    if (text.match(/area[^:]*:\s*([\d.]+)\s*hectares/i)) {
      const areaMatch = text.match(/area[^:]*:\s*([\d.]+)\s*hectares/i);
      if (areaMatch) {
        entities.claimInfo.area = parseFloat(areaMatch[1]);
      }
    }
    
    if (text.includes('APPROVAL NUMBER:') || text.includes('REFERENCE NUMBER:')) {
      const refMatch = text.match(/(?:APPROVAL|REFERENCE) NUMBER:\s*([A-Z0-9\/]+)/);
      if (refMatch) {
        entities.claimInfo.referenceNumber = refMatch[1];
      }
    }
    
    return entities;
  };
  
  const exportToJSON = () => {
    if (!extractedEntities) return;
    
    const dataStr = JSON.stringify(extractedEntities, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileName = `fra_extracted_${new Date().getTime()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewUrl(null);
    setProcessedText('');
    setExtractedEntities(null);
    setActiveTab('ocr');
  };

  return (
    <div className="container mx-auto px-4 py-8 min-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">AI Document Processing</h1>
          <p className="text-gray-600 mt-1">
            Upload and process Forest Rights Act documents using OCR and NER
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {/* File upload section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {!file ? (
                  <div className="space-y-2 relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-500">Drag and drop a file or click to browse</p>
                    <p className="text-sm text-gray-400">Supported formats: JPG, PNG, PDF</p>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf" // Corrected the accept attribute
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                      Select File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      {previewUrl && previewUrl.startsWith('data:image') ? (
                        <img src={previewUrl} alt="Document preview" className="max-h-40 mx-auto" />
                      ) : (
                        <div className="flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 font-medium">{file.name}</p>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={handleRemove} // Use the new handleRemove function
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                      >
                        Remove
                      </button>
                      <button
                        onClick={processOCR}
                        disabled={processing}
                        className={`px-4 py-1 text-sm text-white rounded-md ${
                          processing ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {processing ? 'Processing...' : 'Process Document'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 mt-6 md:mt-0">
              <div className="bg-gray-50 rounded-lg p-4 h-full">
                <h3 className="font-medium text-gray-700 mb-2">Processing Pipeline:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  <li className={`p-2 rounded-md ${file ? 'bg-green-100' : ''}`}>
                    Document Upload
                    {file && <span className="ml-2 text-green-600">✓</span>}
                  </li>
                  <li className={`p-2 rounded-md ${processedText && !processedText.includes('Unable to extract') ? 'bg-green-100' : file ? 'bg-blue-50' : ''}`}>
                    OCR Text Extraction
                    {processedText && !processedText.includes('Unable to extract') && <span className="ml-2 text-green-600">✓</span>}
                  </li>
                  <li className={`p-2 rounded-md ${extractedEntities ? 'bg-green-100' : processedText ? 'bg-blue-50' : ''}`}>
                    NER Entity Recognition
                    {extractedEntities && <span className="ml-2 text-green-600">✓</span>}
                  </li>
                  <li className={`p-2 rounded-md ${extractedEntities ? 'bg-blue-50' : ''}`}>
                    JSON Export & Database Integration
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Results section */}
        {(processedText || extractedEntities) && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">Processing Results</h2>
            
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'ocr'
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('ocr')}
                >
                  OCR Text
                </button>
                <button
                  className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'ner'
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('ner')}
                >
                  Extracted Entities
                </button>
              </nav>
            </div>
            
            {/* Tab content */}
            <div className="mt-4">
              {activeTab === 'ocr' && (
                <div>
                  <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap font-mono text-sm max-h-96 overflow-y-auto">
                    {processedText || 'No text extracted.'}
                  </div>
                </div>
              )}
              
              {activeTab === 'ner' && extractedEntities && (
                <div>
                  <div className="mb-4">
                    <button
                      onClick={exportToJSON}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Export as JSON
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Extracted names */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Names
                      </h4>
                      {extractedEntities.names.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {extractedEntities.names.map((name, index) => (
                            <li key={index} className="text-gray-600">{name}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">No names extracted</p>
                      )}
                    </div>
                    
                    {/* Extracted locations */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Locations
                      </h4>
                      {extractedEntities.locations.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {extractedEntities.locations.map((location, index) => (
                            <li key={index} className="text-gray-600">
                              {location.type}: {location.name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">No locations extracted</p>
                      )}
                    </div>
                    
                    {/* Extracted dates */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        Dates
                      </h4>
                      {extractedEntities.dates && extractedEntities.dates.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {extractedEntities.dates.map((date, index) => (
                            <li key={index} className="text-gray-600">{date}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">No dates extracted</p>
                      )}
                    </div>
                    
                    {/* Claim information */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                        <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                        Claim Information
                      </h4>
                      {Object.keys(extractedEntities.claimInfo).length > 0 ? (
                        <ul className="space-y-1">
                          {Object.entries(extractedEntities.claimInfo).map(([key, value]) => (
                            <li key={key} className="text-gray-600">
                              <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}:</span> {value}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">No claim information extracted</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OcrProcessor;