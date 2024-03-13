// components/RunOptions.tsx
import React from 'react';

interface RunOptionsProps {
  numRuns: number;
  runInParallel: boolean;
  handleNumRunsChange: (value: number) => void;
  handleRunInParallelChange: (value: boolean) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  navigation: any;
}

const RunOptions: React.FC<RunOptionsProps> = ({
  numRuns,
  runInParallel,
  handleNumRunsChange,
  handleRunInParallelChange,
  handleSubmit,
  navigation
}) => {

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center mb-4">
        <div>
          <label htmlFor="numRuns" className="block text-sm font-medium mb-2">
            Number of Runs
          </label>
          <input
            id="numRuns"
            name="numRuns"
            type="number"
            min="1"
            value={numRuns}
            onChange={(e) => handleNumRunsChange(parseInt(e.target.value, 10))}
            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <input
          id="runInParallel"
          name="runInParallel"
          type="checkbox"
          checked={runInParallel}
          onChange={(e) => handleRunInParallelChange(e.target.checked)}
          className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-700 rounded ml-4"
        />
        <label htmlFor="runInParallel" className="ml-2 block text-sm text-gray-300">
          Run in Parallel
        </label>
      </div>
      <button
        type="submit"
        onClick={handleSubmit}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={navigation.state === 'submitting'}
      >
        {navigation.state === 'submitting' ? 'Generating...' : 'Generate and Evaluate'}
      </button>
    </div>
  );
};

export default RunOptions;
