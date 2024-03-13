// app/routes/evaluate.tsx
import { json } from "@remix-run/node";
import { OpenAI } from "openai";
import {EvaluationMethod} from "~/types/EvaluationMethod";
import {Message} from "~/types/MessageInterface";
import {useActionData, useNavigation} from "@remix-run/react";
import EvaluateForm from "~/components/EvaluateForm";
import Results from "~/components/Results";
import React from "react";
import "../styles/app.css";


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
  // const runs = [];
  // for (let i = 0; i < numRuns; i++) {
  //   runs.push(generateAndEvaluate(messages, model, maxTokens as string, temperature as string, evaluatorPrompt as string, evaluationModel as string, evaluationMaxTokens as string, evaluationTemperature as string, evaluationMethod, openai));
  // }


  try {
    const results = await generateAndEvaluate(messages, model, maxTokens as string, temperature as string, evaluatorPrompt as string, evaluationModel as string, evaluationMaxTokens as string, evaluationTemperature as string, evaluationMethod, openai);
    // let results;
    // if (runInParallel) { // todo fix this
    //     results = await Promise.all(runs);
    // } else {
    //     results = await Promise.all(runs.map(run => run()));
    // }
      console.log("results");
      const res = [];
      res.push(results);

    return json({results:res});
  } catch (error) {
    console.error("Error evaluating prompt:", error);
    return json({ error: "An error occurred while evaluating the prompt." }, { status: 500 });
  }
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

  const evaluationMessages = [{"role": "system", "content": evaluatorPrompt}, {"role": "user", "content": generatedText}];
  const evaluation = await openai.chat.completions.create({
    model: evaluationModel,
    messages: evaluationMessages,
    max_tokens: Number(evaluationMaxTokens),
    temperature: Number(evaluationTemperature),
  });
  const evaluationText = evaluation.choices[0].message['content'];

  // const { meetExpectation, score } = evaluatePrompt(evaluationText, evaluationMethod);

  // return { generatedText, evaluationText, score, meetExpectation };
  return { generatedText, evaluationText, score:1, meetExpectation:true };
}

export default function Evaluate() {
  const data = useActionData<typeof action>();
  const navigation = useNavigation();

  return (
      <div className="bg-gray-900 text-white min-h-screen">
          <div className="max-w-7xl mx-auto px-4 py-12">
              <h1 className="text-4xl font-extrabold tracking-tight text-center mb-8">Evaluate LLM Prompts</h1>
              <EvaluateForm api={'/evaluate'} navigation={navigation}/>
              {data && <Results data={data} navigation={navigation}/>}
          </div>
      </div>);
}
