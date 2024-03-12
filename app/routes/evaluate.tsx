// app/routes/evaluate.tsx

import { Form, useActionData, useNavigation } from "@remix-run/react";
import { json } from "@remix-run/node";
import { OpenAI } from "openai";
import { useState } from "react";
import "../styles/app.css";

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const prompt = formData.get("prompt");
  const apiKey = formData.get("apiKey");
  const maxTokens = formData.get("maxTokens") || 800;
  const evaluationMaxTokens = formData.get("evaluationMaxTokens") || 800;
  const temperature = formData.get("temperature") || 0.0;
  const evaluationTemperature = formData.get("evaluationTemperature") || 0.0;
  const model = formData.get("model") || 'gpt-3.5-turbo';
  const evaluationModel = formData.get("evaluationModel") || 'gpt-3.5-turbo';
  const formMessages = formData.get("messages") || [];
  const messages = [{ role: 'system', content: prompt }, ...formMessages];

  const evaluatorPrompt = formData.get("evaluatorPrompt");
  const numRuns = parseInt(formData.get("numRuns") as string) || 1;
  const runInParallel = formData.get("runInParallel") === "on";

  const evaluationMethod: EvaluationMethod = {
    exactMatch: {
      value: formData.get("exactMatchValue") || '',
      type: formData.get("exactMatchType") as 'number' | 'boolean' | 'string' || 'string'
    },
    range: {
      min: parseFloat(formData.get("rangeMin") as string) || 0,
      max: parseFloat(formData.get("rangeMax") as string) || 0
    },
    csvMatch: {
      expectedValues: (formData.get("csvMatchValues") || '').split(',').map(value => value.trim()),
      caseSensitive: formData.get("csvMatchCaseSensitive") === 'on'
    },
    booleanMatch: {
      expectedValue: formData.get("booleanMatchValue") || ''
    }
  };

  if (typeof apiKey !== "string") {
    return json({ error: "Please provide a valid API key." }, { status: 400 });
  }

  const configuration = {
    apiKey: apiKey,
  };

  const openai = new OpenAI(configuration);

  const runs = [];
  for (let i = 0; i < numRuns; i++) {
    runs.push(generateAndEvaluate(messages, model, maxTokens as string, temperature as string, evaluatorPrompt as string, evaluationModel as string, evaluationMaxTokens as string, evaluationTemperature as string, evaluationMethod, openai));
  }


  try {
    let results;
    if (runInParallel) { // todo fix this
        results = await Promise.all(runs);
    } else {
        results = await Promise.all(runs.map(run => run()));
    }

    return json({ results, evaluatorPrompt });
  } catch (error) {
    console.error("Error evaluating prompt:", error);
    return json({ error: "An error occurred while evaluating the prompt." }, { status: 500 });
  }
}

interface EvaluationMethod {
  exactMatch?: {
    value: number | boolean | string;
    type: 'number' | 'boolean' | 'string';
  };
  range?: {
    min: number;
    max: number;
  };
  csvMatch?: {
    expectedValues: string[];
    caseSensitive: boolean;
  };
  booleanMatch?: {
    expectedValue: string;
  };
}

const evaluatePrompt = (evaluationText: string, evaluationMethod: EvaluationMethod) => {
  let meetExpectation = false;

  if (evaluationMethod.exactMatch) {
    const { value, type } = evaluationMethod.exactMatch;
    meetExpectation = evaluationText === value.toString();
  } else if (evaluationMethod.range) {
    const { min, max } = evaluationMethod.range;
    const score = parseFloat(evaluationText);
    meetExpectation = score >= min && score <= max;
  } else if (evaluationMethod.csvMatch) {
    const { expectedValues, caseSensitive } = evaluationMethod.csvMatch;
    const providedValues = evaluationText.split(',').map(value => caseSensitive ? value.trim() : value.trim().toLowerCase());
    const matchedValues = expectedValues.filter(value => providedValues.includes(caseSensitive ? value : value.toLowerCase()));
    meetExpectation = matchedValues.length === expectedValues.length;
  } else if (evaluationMethod.booleanMatch) {
    const { expectedValue } = evaluationMethod.booleanMatch;
    meetExpectation = evaluationText.toLowerCase() === expectedValue.toLowerCase();
  }

  const scoreRegex = /Score: (\\d+(\\.\\d+)?)/i;
  const scoreMatch = evaluationText.match(scoreRegex);
  const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0.0;

  return { meetExpectation, score };
};

async function generateAndEvaluate(messages: Message[], completionModel: string, completionMaxTokens: string, completionTemperature: string, evaluatorPrompt: string, evaluationModel: string, evaluationMaxTokens: string, evaluationTemperature: string, evaluationMethod: EvaluationMethod, openai: OpenAI) {
  const completion = await openai.chat.completions.create({
    model: completionModel,
    messages: messages,
    max_tokens: Number(completionMaxTokens),
    temperature: Number(completionTemperature),
  });
  const generatedText = completion.choices[0].message['content'];

  const evaluation = await openai.chat.completions.create({
    model: evaluationModel,
    messages: [{"role": "system", "content": evaluatorPrompt}, {"role": "user", "content": generatedText}],
    max_tokens: Number(evaluationMaxTokens),
    temperature: Number(evaluationTemperature),
  });

  const evaluationText = evaluation.choices[0].message['content'];

  // todo don't just do score matching
  const { meetExpectation, score } = evaluatePrompt(evaluationText, evaluationMethod);

  return { generatedText, evaluationText, score, meetExpectation };
}

export default function Evaluate() {
  const data = useActionData<typeof action>();
  const navigation = useNavigation();
  const [showKey, setShowKey] = useState(false);
  const [saveKey, setSaveKey] = useState(false);
  const [showEvaluator, setShowEvaluator] = useState(true);
  const [showEvaluationMethod, setShowEvaluationMethod] = useState(true);
  const [temperature, setTemperature] = useState(0.5);
  const [evaluationTemperature, setEvaluationTemperature] = useState(0.5);
  const [currentRun, setCurrentRun] = useState(0);
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo");
  const [selectedEvaluationModel, setSelectedEvaluationModel] = useState("gpt-3.5-turbo");
  const [modelOptions, setModelOptions] = useState([
    "gpt-3.5-turbo",
    "gpt-3.5-turbo-0125",
    "gpt-3.5-turbo-1106",
    "gpt-4-0125-preview",
    "gpt-4-turbo-preview",
    "gpt-4-1106-preview",
    "gpt-4-vision-preview",
  ]);

  const handleToggleKey = () => {
    setShowKey(!showKey);
  };

  const handleSaveKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaveKey(e.target.checked);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (saveKey) {
      const apiKey = (e.currentTarget.elements.namedItem("apiKey") as HTMLInputElement).value;
      localStorage.setItem("openaiKey", apiKey);
    } else {
      localStorage.removeItem("openaiKey");
    }
  };

  const storedApiKey = typeof window !== "undefined" ? localStorage.getItem("openaiKey") || "" : "";

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-center mb-8">Evaluate LLM Prompts</h1>
        <Form method="post" className="space-y-8" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium mb-2">OpenAI API Key</label>
            <div className="flex">
              <input
                id="apiKey"
                name="apiKey"
                type={showKey ? "text" : "password"}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-l-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={storedApiKey}
              />
              <button
                type="button"
                className="bg-gray-700 hover:bg-gray-600 rounded-r-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={handleToggleKey}
              >
                {showKey ? "Hide" : "Show"}
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
              <label htmlFor="saveKey" className="ml-2 block text-sm text-gray-300">Save API Key</label>
            </div>
          </div>
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium mb-2">Prompt</label>
            <textarea id="prompt" name="prompt" rows={4} required className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <button
              type="button"
              className="flex items-center text-sm font-medium text-blue-500 hover:text-blue-400 focus:outline-none"
              onClick={() => setShowEvaluator(!showEvaluator)}
            >
              <span>{showEvaluator ? "Hide Evaluator" : "Show Evaluator"}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ml-1 transition-transform ${showEvaluator ? "transform rotate-180" : ""}`}
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
            {showEvaluator && (
                <div className="mt-4">
                    <div>
                        <label htmlFor="evaluatorPrompt" className="block text-sm font-medium mb-2">Evaluator
                            Prompt</label>
                        <textarea
                            id="evaluatorPrompt"
                            name="evaluatorPrompt"
                            rows={4}
                            defaultValue="Please provide an evaluation of the generated text based on its quality, coherence, and relevance to the prompt. Include a score between 0 and 1."
                            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="evaluationMaxTokens" className="block text-sm font-medium mb-2">Evaluation
                                Max
                                Tokens</label>
                            <input
                                id="evaluationMaxTokens"
                                name="evaluationMaxTokens"
                                type="number"
                                min="1"
                                defaultValue="800"
                                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="evaluationModel" className="block text-sm font-medium mb-2">Evaluation
                                Model</label>
                            <select
                                id="evaluationModel"
                                name="evaluationModel"
                                value={selectedEvaluationModel}
                                onChange={(e) => setSelectedEvaluationModel(e.target.value)}
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
                            <label htmlFor="evaluationTemperature" className="block text-sm font-medium mb-2">Evaluation
                                Temperature</label>
                            <div className="flex items-center">
                                <input
                                    id="evaluationTemperature"
                                    name="evaluationTemperature"
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={evaluationTemperature}
                                    onChange={(e) => setEvaluationTemperature(parseFloat(e.target.value))}
                                    className="w-full bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm">{evaluationTemperature.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="flex items-center text-sm font-medium text-blue-500 hover:text-blue-400 focus:outline-none"
                        onClick={() => setShowEvaluationMethod(!showEvaluationMethod)}
                    >
                        <span>{showEvaluationMethod ? "Hide Evaluation Method" : "Show Evaluation Method"}</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 ml-1 transition-transform ${showEvaluationMethod ? "transform rotate-180" : ""}`}
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
                    {showEvaluationMethod && (<div className="mt-4">
                        <h3 className="text-lg font-bold mb-2">Evaluation Method</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label htmlFor="exactMatchValue" className="block text-sm font-medium mb-2">Exact Match
                                    Value</label>
                                <input
                                    id="exactMatchValue"
                                    name="exactMatchValue"
                                    type="text"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="exactMatchType" className="block text-sm font-medium mb-2">Exact Match
                                    Type</label>
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
                                <label htmlFor="rangeMin" className="block text-sm font-medium mb-2">Range Min</label>
                                <input
                                    id="rangeMin"
                                    name="rangeMin"
                                    type="number"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="rangeMax" className="block text-sm font-medium mb-2">Range Max</label>
                                <input
                                    id="rangeMax"
                                    name="rangeMax"
                                    type="number"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="csvMatchValues" className="block text-sm font-medium mb-2">CSV Match
                                    Values</label>
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
                                <label htmlFor="csvMatchCaseSensitive" className="ml-2 block text-sm text-gray-300">Case
                                    Sensitive</label>
                            </div>
                            <div>
                                <label htmlFor="booleanMatchValue" className="block text-sm font-medium mb-2">Boolean
                                    Match Value</label>
                                <input
                                    id="booleanMatchValue"
                                    name="booleanMatchValue"
                                    type="text"
                                    placeholder="true or false"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>)}
                </div>
            )}
          </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="model" className="block text-sm font-medium mb-2">Model</label>
                    <select
                        id="model"
                        name="model"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
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
                    <label htmlFor="maxTokens" className="block text-sm font-medium mb-2">Max Tokens</label>
                    <input
                        id="maxTokens"
                        name="maxTokens"
                        type="number"
                        min="1"
                        defaultValue="800"
                        className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="temperature" className="block text-sm font-medium mb-2">Temperature</label>
                    <div className="flex items-center">
                        <input
                            id="temperature"
                            name="temperature"
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm">{temperature.toFixed(2)}</span>
                    </div>
                </div>
                <div>
                    <label htmlFor="numRuns" className="block text-sm font-medium mb-2">Number of Runs</label>
                    <input
                        id="numRuns"
                        name="numRuns"
                        type="number"
                        min="1"
                        defaultValue="1"
                        className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            <div className="flex items-center">
                <input
                    id="runInParallel"
                    name="runInParallel"
                    type="checkbox"
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-700 rounded"
                />
                <label htmlFor="runInParallel" className="ml-2 block text-sm text-gray-300">Run in Parallel</label>
            </div>
            <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={navigation.state === 'submitting'}
            >
                {navigation.state === 'submitting' ? 'Generating...' : 'Generate and Evaluate'}
            </button>
        </Form>
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
                  {showEvaluator && (
                    <>
                      <h4 className="text-lg font-bold mb-2">Evaluation</h4>
                      <p className="mb-4">{result.evaluationText}</p>
                      <h4 className="text-lg font-bold">Score: {result.score}</h4>
                      <h4 className="text-lg font-bold">Meets Expectation: {result.meetExpectation ? "Yes" : "No"}</h4>
                    </>)}
                </div>
            </div>))}
        </div>)}
        </div>
    </div>);
}
