import React from 'react';

const Feedback = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Give Feedback</h1>
        <p className="text-gray-600 mb-6">
          We value your feedback! Please let us know how we can improve.
        </p>
        <form>
          <div className="mb-4">
            <label htmlFor="feedbackType" className="block text-gray-700 font-medium mb-2">Feedback Type</label>
            <select id="feedbackType" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400">
              <option>General Feedback</option>
              <option>Bug Report</option>
              <option>Feature Request</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="feedback" className="block text-gray-700 font-medium mb-2">Feedback</label>
            <textarea id="feedback" rows="6" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"></textarea>
          </div>
          <button
            type="submit"
            className="bg-gray-800 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;