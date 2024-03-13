import React, {useEffect} from 'react';
import {Message} from "~/types/MessageInterface";

interface PromptTabProps {
  messages: Message[];
  setMessages: (data: any) => void;
  temperature: number;
  handleTemperatureChange: (data: any) => void;
  selectedModel: string;
  handleModelChange: (data: any) => void;
  modelOptions: string[];
  prompt: string;
  handlePromptChange: (data: any) => void;
  maxTokens: number;
  handleMaxTokensChange: (data: any) => void;
}

export default function PromptTab({ temperature, handleTemperatureChange, selectedModel, handleModelChange, modelOptions, prompt, handlePromptChange, maxTokens, handleMaxTokensChange }: PromptTabProps) {

  return (
    <>
        <div>
            <label htmlFor="prompt" className="block text-sm font-medium mb-2">
                Prompt
            </label>
            <textarea
                id="prompt"
                name="prompt"
                rows={4}
                required
                value={prompt}
                onChange={(e) => handlePromptChange(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="model" className="block text-sm font-medium mb-2">
                    Model
                </label>
                <select
                    id="model"
                    name="model"
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
          <label htmlFor="maxTokens" className="block text-sm font-medium mb-2">
            Max Tokens
          </label>
          <input
            id="maxTokens"
            name="maxTokens"
            type="number"
            min="1"
            value={maxTokens}
            onChange={(e) => handleMaxTokensChange(parseInt(e.target.value, 10))}
            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="temperature" className="block text-sm font-medium mb-2">
            Temperature
          </label>
          <div className="flex items-center">
            <input
              id="temperature"
              name="temperature"
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
    </>
  );
}
