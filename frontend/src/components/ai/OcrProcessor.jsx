import { useState } from "react";

const OcrProcessor = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processedText, setProcessedText] = useState("");
  const [extractedEntities, setExtractedEntities] = useState(null);
  const [activeTab, setActiveTab] = useState("ocr");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (
      selectedFile &&
      (selectedFile.type === "image/jpeg" ||
        selectedFile.type === "image/png" ||
        selectedFile.type === "application/pdf")
    ) {
      setFile(selectedFile);

      if (selectedFile.type.startsWith("image")) {
        const fileReader = new FileReader();
        fileReader.onload = () => setPreviewUrl(fileReader.result);
        fileReader.readAsDataURL(selectedFile);
      } else {
        setPreviewUrl("/images/PDFDocument.jpg");
      }

      setProcessedText("");
      setExtractedEntities(null);
    }
  };

  const processOCR = async () => {
    if (!file) return;
    setProcessing(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/ocr/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      setProcessedText(result.ocr_text || "");
      setExtractedEntities(result.entities || null);
    } catch (error) {
      console.error("OCR processing failed:", error);
      alert("Failed to process document. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const exportToJSON = () => {
    if (!extractedEntities) return;

    const dataStr = JSON.stringify(extractedEntities, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute(
      "download",
      `fra_extracted_${new Date().getTime()}.json`
    );
    linkElement.click();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            AI Document Processing
          </h1>
          <p className="text-gray-600 mt-1">
            Upload and process Forest Rights Act documents using OCR and NER
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Upload Box */}
            <div className="flex-1">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center relative">
                {!file ? (
                  <div>
                    <p className="mt-2 text-gray-500">
                      Drag and drop a file or click to browse
                    </p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {previewUrl && file.type.startsWith("image") && (
                      <img
                        src={previewUrl}
                        alt="Document preview"
                        className="max-h-40 mx-auto"
                      />
                    )}
                    {previewUrl && file.type === "application/pdf" && (
                      <img
                        src={previewUrl}
                        alt="PDF preview"
                        className="max-h-40 mx-auto"
                      />
                    )}
                    <p className="text-gray-700 font-medium">{file.name}</p>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setFile(null);
                          setPreviewUrl(null);
                          setProcessedText("");
                          setExtractedEntities(null);
                        }}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                      >
                        Remove
                      </button>
                      <button
                        onClick={processOCR}
                        disabled={processing}
                        className={`px-4 py-1 text-sm text-white rounded-md ${
                          processing
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {processing ? "Processing..." : "Process Document"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Processing Pipeline */}
            <div className="flex-1 mt-6 md:mt-0">
              <div className="bg-gray-50 rounded-lg p-4 h-full">
                <h3 className="font-medium text-gray-700 mb-2">
                  Processing Pipeline:
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  <li
                    className={`p-2 rounded-md ${
                      file ? "bg-green-100" : ""
                    }`}
                  >
                    Document Upload {file && <span className="ml-2 text-green-600">✓</span>}
                  </li>
                  <li
                    className={`p-2 rounded-md ${
                      processedText
                        ? "bg-green-100"
                        : file
                        ? "bg-blue-50"
                        : ""
                    }`}
                  >
                    OCR Text Extraction {processedText && <span className="ml-2 text-green-600">✓</span>}
                  </li>
                  <li
                    className={`p-2 rounded-md ${
                      extractedEntities
                        ? "bg-green-100"
                        : processedText
                        ? "bg-blue-50"
                        : ""
                    }`}
                  >
                    Entity Recognition {extractedEntities && <span className="ml-2 text-green-600">✓</span>}
                  </li>
                  <li
                    className={`p-2 rounded-md ${
                      extractedEntities ? "bg-blue-50" : ""
                    }`}
                  >
                    JSON Export & Database Integration
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {(processedText || extractedEntities) && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">Processing Results</h2>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                    activeTab === "ocr"
                      ? "border-green-600 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("ocr")}
                >
                  OCR Text
                </button>
                <button
                  className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                    activeTab === "ner"
                      ? "border-green-600 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("ner")}
                >
                  Extracted Entities
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-4">
              {activeTab === "ocr" && (
                <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap font-mono text-sm max-h-96 overflow-y-auto">
                  {processedText || "No text extracted."}
                </div>
              )}

              {activeTab === "ner" && extractedEntities && (
                <div>
                  <div className="mb-4">
                    <button
                      onClick={exportToJSON}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Export as JSON
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(extractedEntities).map(([key, value]) => (
                      <div key={key} className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-700 mb-2 capitalize">{key}</h4>
                        {Array.isArray(value) && value.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {value.map((item, index) => (
                              <li key={index} className="text-gray-600">{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 italic">{value || "Not extracted"}</p>
                        )}
                      </div>
                    ))}
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
