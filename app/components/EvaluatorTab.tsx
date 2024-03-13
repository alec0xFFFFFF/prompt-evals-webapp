import React, {useState} from 'react';

interface EvaluatorTabProps {
  temperature: number;
  handleTemperatureChange: (data: any) => void;
  selectedModel: string;
  handleModelChange: (data: any) => void;
  modelOptions: string[];
  prompt: string;
  handlePromptChange: (data: any) => void;
  maxTokens: number;
  handleMaxTokensChange: (data: any) => void;
  evaluationMethod: any;
  setEvaluationMethod: (data: any) => void;
}

export default function EvaluatorTab({ temperature, handleTemperatureChange, selectedModel, handleModelChange, modelOptions, prompt, handlePromptChange, maxTokens, handleMaxTokensChange }: EvaluatorTabProps) {
    const [showEvaluationMethod, setShowEvaluationMethod] = useState(false);
    return (
    <div>
        <div className="mt-4">
            <div>
                <label htmlFor="evaluatorPrompt" className="block text-sm font-medium mb-2">
                    Evaluator Prompt
                </label>
                <textarea
                    id="evaluatorPrompt"
                    name="evaluatorPrompt"
                    rows={4}
                    value={prompt}
                    onChange={e => handlePromptChange(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="evaluationModel" className="block text-sm font-medium mb-2">
                        Evaluation Model
                    </label>
                    <select
                        id="evaluationModel"
                        name="evaluationModel"
                        value={selectedModel}
                        onChange={(e) => handleModelChange(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {modelOptions.map((model) => (
                            <option key={model} value={model}>
                                {model}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="evaluationMaxTokens" className="block text-sm font-medium mb-2">
                        Evaluation Max Tokens
                    </label>
                    <input
                        id="evaluationMaxTokens"
                        name="evaluationMaxTokens"
                        type="number"
                        min="1"
                        value={maxTokens}
                        onChange={e => handleMaxTokensChange(parseInt(e.target.value, 10))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="evaluationTemperature" className="block text-sm font-medium mb-2">
                        Evaluation Temperature
                    </label>
                    <div className="flex items-center">
                        <input
                            id="evaluationTemperature"
                            name="evaluationTemperature"
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={temperature}
                            onChange={(e) => handleTemperatureChange(parseFloat(e.target.value))}
                            className="w-full bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm">{temperature.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <button
                type="button"
                className="flex items-center text-sm font-medium text-blue-500 hover:text-blue-400 focus:outline-none"
                onClick={() => setShowEvaluationMethod(!showEvaluationMethod)}
            >
                <span>{showEvaluationMethod ? 'Hide Evaluation Method' : 'Show Evaluation Method'}</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ml-1 transition-transform ${showEvaluationMethod ? 'transform rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
            {showEvaluationMethod && (
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Evaluation Method</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="exactMatchValue" className="block text-sm font-medium mb-2">
                Exact Match Value
              </label>
              <input
                id="exactMatchValue"
                name="exactMatchValue"
                type="text"
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="exactMatchType" className="block text-sm font-medium mb-2">
                Exact Match Type
              </label>
              <select
                id="exactMatchType"
                name="exactMatchType"
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="string">String</option>
              </select>
            </div>
            <div>
              <label htmlFor="rangeMin" className="block text-sm font-medium mb-2">
                Range Min
              </label>
              <input
                id="rangeMin"
                name="rangeMin"
                type="number"
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="rangeMax" className="block text-sm font-medium mb-2">
                Range Max
              </label>
              <input
                id="rangeMax"
                name="rangeMax"
                type="number"
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="csvMatchValues" className="block text-sm font-medium mb-2">
                CSV Match Values
              </label>
              <input
                id="csvMatchValues"
                name="csvMatchValues"
                type="text"
                placeholder="value1, value2, value3"
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center">
              <input
                id="csvMatchCaseSensitive"
                name="csvMatchCaseSensitive"
                type="checkbox"
                className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-700 rounded"
              />
              <label htmlFor="csvMatchCaseSensitive" className="ml-2 block text-sm text-gray-300">
                Case Sensitive
              </label>
            </div>
            <div>
              <label htmlFor="booleanMatchValue" className="block text-sm font-medium mb-2">
                Boolean Match Value
              </label>
              <input
                id="booleanMatchValue"
                name="booleanMatchValue"
                type="text"
                placeholder="true or false"
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
