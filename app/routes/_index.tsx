// app/routes/index.tsx
import { Link } from "@remix-run/react";
import { MetaFunction } from "@remix-run/node";
import "../styles/app.css";
import React from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "LLM Prompt Evaluator" },
    { name: "description", content: "Evaluate and optimize your LLM prompts with ease" },
  ];
};

export default function Index() {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight">LLM Prompt Evaluator</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link to="/evaluate" className="text-blue-400 hover:text-blue-500">
                  Get Started
                </Link>
              </li>
              <li>
                <a href="#features" className="text-gray-400 hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-400 hover:text-white">
                  Pricing
                </a>
              </li>
            </ul>
          </nav>
        </header>

        <main>
          <section className="text-center mb-16">
            <h2 className="text-5xl font-extrabold mb-4">Unleash the Power of LLM Prompts</h2>
            <p className="text-xl text-gray-400 mb-8">
              Evaluate, optimize, and supercharge your prompts for unparalleled results
            </p>
            <Link
              to="/evaluate"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full"
            >
              Try It Now
            </Link>
          </section>

          <section id="features" className="mb-16">
            <h2 className="text-3xl font-extrabold mb-8">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Prompt Evaluation</h3>
                <p className="text-gray-400">
                  Quickly evaluate the effectiveness of your LLM prompts and identify areas for improvement
                </p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Prompt Optimization</h3>
                <p className="text-gray-400">
                  Fine-tune your prompts for optimal performance and achieve better results
                </p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Customizable Evaluation</h3>
                <p className="text-gray-400">
                  Tailor the evaluation process to your specific needs and requirements
                </p>
              </div>
            </div>
          </section>

          <section id="pricing" className="text-center">
            <h2 className="text-3xl font-extrabold mb-8">Pricing Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-800 p-8 rounded-lg">
                <h3 className="text-2xl font-bold mb-4">Basic</h3>
                <p className="text-4xl font-extrabold mb-4">$9<span className="text-xl">/month</span></p>
                <ul className="text-left mb-8">
                  <li className="mb-2">10 evaluations per month</li>
                  <li className="mb-2">Basic optimization suggestions</li>
                  <li>Email support</li>
                </ul>
                <Link
                  to="/evaluate"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                  Choose Plan
                </Link>
              </div>
              <div className="bg-gray-800 p-8 rounded-lg">
                <h3 className="text-2xl font-bold mb-4">Pro</h3>
                <p className="text-4xl font-extrabold mb-4">$29<span className="text-xl">/month</span></p>
                <ul className="text-left mb-8">
                  <li className="mb-2">100 evaluations per month</li>
                  <li className="mb-2">Advanced optimization suggestions</li>
                  <li className="mb-2">Priority email support</li>
                  <li>API access</li>
                </ul>
                <Link
                  to="/evaluate"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                  Choose Plan
                </Link>
              </div>
              <div className="bg-gray-800 p-8 rounded-lg">
                <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
                <p className="text-4xl font-extrabold mb-4">Custom</p>
                <ul className="text-left mb-8">
                  <li className="mb-2">Unlimited evaluations</li>
                  <li className="mb-2">Custom optimization strategies</li>
                  <li className="mb-2">Dedicated support</li>
                  <li>Full API access</li>
                </ul>
                <Link
                  to="/contact"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </section>
        </main>

        <footer className="text-center py-8">
          <p className="text-gray-400">&copy; {new Date().getFullYear()} LLM Prompt Evaluator. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
