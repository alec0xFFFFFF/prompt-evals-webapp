import React, {useEffect, useState} from 'react';
import PromptTab from './PromptTab';
import EvaluatorTab from './EvaluatorTab';
import {Form} from "@remix-run/react";
import RunOptions from "~/components/RunOptions";

interface EvaluateFormProps {
    data: any;
    api: string;
    navigation: any;
}

export default function EvaluateForm({data, api, navigation}: EvaluateFormProps) {
  const [requestPending, setRequestPending] = useState(false);
  const [activeTab, setActiveTab] = useState('prompt');
  const [showKey, setShowKey] = useState(false);
  const [saveKey, setSaveKey] = useState(false);
  const [numRuns, setNumRuns] = useState(1);
  const [runInParallel, setRunInParallel] = useState(false);

  const [messages, setMessages] = useState([]);
  const [promptTemperature, setPromptTemperature] = useState(0.5);
  const [selectedPromptModel, setSelectedPromptModel] = useState('gpt-3.5-turbo');
  const [modelOptions, setModelOptions] = useState([
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-0125',
    'gpt-3.5-turbo-1106',
    'gpt-4-0125-preview',
    'gpt-4-turbo-preview',
    'gpt-4-1106-preview',
    'gpt-4-vision-preview',
  ]);
  const [prompt, setPrompt] = useState('');
  const [maxPromptTokens, setMaxPromptTokens] = useState(800);

  const [evaluationTemperature, setEvaluationTemperature] = useState(0.5);
  const [selectedEvaluationModel, setSelectedEvaluationModel] = useState('gpt-3.5-turbo');

  const [evaluationPrompt, setEvaluationPrompt] = useState('');
  const [maxEvaluationTokens, setMaxEvaluationTokens] = useState(800);

  const [evaluationMethod, setEvaluationMethod] = useState({});

  const storedApiKey = typeof window !== 'undefined' ? localStorage.getItem('openaiKey') || '' : '';
  const [apiKey, setApiKey] = useState(storedApiKey);

  useEffect(() => {
    if (data) {
      // Initialize form fields or perform data processing based on the received data
      // ...
    }
  }, [data]);
  const handleToggleKey = () => {
    setShowKey(!showKey);
  };

  const handleSaveKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaveKey(e.target.checked);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (requestPending) {
      return;
    }
    setRequestPending(true);
    e.preventDefault();
    const formData = new FormData();

    // Add prompt data to the form data
    formData.append('prompt', prompt);
    formData.append('evaluatorPrompt', evaluationPrompt);
    formData.append('maxTokens', maxPromptTokens);
    formData.append('evaluationMaxTokens', maxEvaluationTokens);
    formData.append('temperature', promptTemperature);
    formData.append('evaluationTemperature', evaluationTemperature);
    formData.append('model', selectedPromptModel);
    formData.append('evaluationModel', selectedEvaluationModel);
    formData.append('messages', messages);


    // evaluation method
      // todo
    formData.append('exactMatchValue', '');
    formData.append('exactMatchType', '');
    formData.append('rangeMin', '');
    formData.append('rangeMax', '');
    formData.append('csvMatchValues', '');
    formData.append('csvMatchCaseSensitive', '');
    formData.append('booleanMatchValue', '');

    // Add other form data
    formData.append('numRuns', numRuns.toString());
    formData.append('runInParallel', runInParallel.toString());
    formData.append('apiKey', apiKey);

    if (saveKey) {
      localStorage.setItem('openaiKey', apiKey);
    } else {
      localStorage.removeItem('openaiKey');
    }

    try {
      const response = await fetch(api, {
        method: 'POST',
        body: formData,
      });
      // todo figure out why this is failing
      const data = await response.json();
      console.log(data);
      setRequestPending(false);
    } catch (error) {
      console.error('Error:', error);
      setRequestPending(false);
    }
  };

  const handleNumRunsChange = (value: number) => {
    setNumRuns(value);
  };

  const handleRunInParallelChange = (value: boolean) => {
    setRunInParallel(value);
  };

  return (
    <div>
      <Form action={api} method="post" className="space-y-8" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
              OpenAI API Key
            </label>
            <div className="flex">
              <input
                id="apiKey"
                name="apiKey"
                type={showKey ? 'text' : 'password'}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-l-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
              <button
                type="button"
                className="bg-gray-700 hover:bg-gray-600 rounded-r-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={handleToggleKey}
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="mt-2 flex items-center">
              <input
                id="saveKey"
                name="saveKey"
                type="checkbox"
                checked={saveKey}
                onChange={handleSaveKey}
                className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-700 rounded"
              />
              <label htmlFor="saveKey" className="ml-2 block text-sm text-gray-300">
                Save API Key
              </label>
            </div>
          </div>
          <div className="mb-8">
            <div className="border-b border-gray-700">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  type="button"
                  onClick={() => setActiveTab('prompt')}
                  className={`${
                    activeTab === 'prompt'
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <span>Prompt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('evaluator')}
                  className={`${
                    activeTab === 'evaluator'
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <span>Evaluator</span>
                </button>
              </nav>
            </div>
          </div>
          {activeTab === 'prompt' && <PromptTab temperature={promptTemperature} messages={messages} setMessages={setMessages} handleTemperatureChange={setPromptTemperature} selectedModel={selectedPromptModel} handleModelChange={setSelectedPromptModel} modelOptions={modelOptions} prompt={prompt} handlePromptChange={setPrompt} maxTokens={maxPromptTokens} handleMaxTokensChange={setMaxPromptTokens} />}
          {activeTab === 'evaluator' && <EvaluatorTab temperature={evaluationTemperature} handleTemperatureChange={setEvaluationTemperature} selectedModel={selectedEvaluationModel} handleModelChange={setSelectedEvaluationModel} modelOptions={modelOptions} prompt={evaluationPrompt} handlePromptChange={setEvaluationPrompt} maxTokens={maxEvaluationTokens} handleMaxTokensChange={setMaxEvaluationTokens} evaluationMethod={evaluationMethod} setEvaluationMethod={setEvaluationMethod} />}
          <RunOptions
            numRuns={numRuns}
            runInParallel={runInParallel}
            handleNumRunsChange={handleNumRunsChange}
            handleRunInParallelChange={handleRunInParallelChange}
            handleSubmit={handleSubmit}
            navigation={navigation}
          />
      </Form>
    </div>
  );
}
