'use client';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-black mb-4">
          CivicSpark AI - Test Page
        </h1>
        <p className="text-gray-600 mb-8">
          If you can see this text, the page is working properly.
        </p>
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <p><strong>Status:</strong> Page is loading correctly!</p>
        </div>
      </div>
    </div>
  );
}
