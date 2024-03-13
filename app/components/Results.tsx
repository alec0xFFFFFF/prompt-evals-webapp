import React from 'react';

interface ResultsProps {
    data: any;
    navigation: any;
}

export default function Results({data, navigation}: ResultsProps) {
  const [currentRun, setCurrentRun] = React.useState(0);

  return (
    <>
      {data?.error && (
        <div className="mt-8 bg-red-800 text-white p-4 rounded">
          <p>Error: {data.error}</p>
        </div>
      )}
      {data?.results && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Results</h2>
          {data.results.map((result, index) => (
            <div key={index} className="mb-8">
              <h3 className="text-xl font-bold mb-2">
                Run {index + 1} {index === currentRun && navigation.state === 'submitting' ? '(Running...)' : ''}
              </h3>
              <div className="bg-gray-800 p-4 rounded">
                <h4 className="text-lg font-bold mb-2">Generated Text</h4>
                <p className="mb-4">{result.generatedText}</p>
                <h4 className="text-lg font-bold mb-2">Evaluation</h4>
                <p className="mb-4">{result.evaluationText}</p>
                <h4 className="text-lg font-bold">Score: {result.score}</h4>
                <h4 className="text-lg font-bold">Meets Expectation: {result.meetExpectation ? 'Yes' : 'No'}</h4>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
