import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const BASE_URL = 'https://tech-match-backend-eglb.onrender.com'; // Update if needed

const fetchPairs = async (category = 'all') => {
  const response = await fetch(`${BASE_URL}/api/pairs?category=${category}`);
  const data = await response.json();
  return data;
};

const addPair = async (term, match, category) => {
  await fetch(`${BASE_URL}/api/pairs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ term, match, category })
  });
};

const shuffle = (array) => {
  return array
    .flatMap(pair => [
      { label: pair.term, id: `${pair.term}-term`, match: pair.match },
      { label: pair.match, id: `${pair.match}-match`, match: pair.match },
    ])
    .sort(() => Math.random() - 0.5);
};

export default function FlashcardGame() {
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState([]);
  const [matches, setMatches] = useState([]);
  const [category, setCategory] = useState('all');
  const [term, setTerm] = useState('');
  const [match, setMatch] = useState('');
  const [adminCategory, setAdminCategory] = useState('dotnet');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetchPairs(category).then((data) => setCards(shuffle(data)));
  }, [category]);

  const handleClick = (card) => {
    if (selected.length === 2) return;
    const newSelected = [...selected, card];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (first.match === second.match && first.id !== second.id) {
        setMatches([...matches, first.match]);
        setSelected([]);
      } else {
        setTimeout(() => setSelected([]), 1000);
      }
    }
  };

  const resetGame = () => {
    fetchPairs(category).then((data) => {
      setCards(shuffle(data));
      setSelected([]);
      setMatches([]);
    });
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleAddPair = async () => {
    if (term && match && adminCategory) {
      await addPair(term, match, adminCategory);
      setTerm('');
      setMatch('');
      if (category === adminCategory) resetGame();
    }
  };

  const closeModal = (e) => {
    if (e.target.id === 'modal-bg') setShowHelp(false);
  };

  return (
    <div className="p-4 grid gap-6 relative">
      <h1 className="text-2xl font-bold text-center">Tech Match Flashcards</h1>

      <div className="text-center mb-4 space-y-2">
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          onClick={() => setShowHelp(true)}
        >
          How to Play
        </button>
        <div>
          <label className="mr-2 font-medium">Choose a category:</label>
          <select value={category} onChange={handleCategoryChange} className="border p-2 rounded">
            <option value="all">All</option>
            <option value="dotnet">.NET</option>
            <option value="java">Java</option>
            <option value="cloud">AWS & Azure</option>
            <option value="api">API</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            onClick={() => handleClick(card)}
            className={`cursor-pointer ${
              selected.includes(card) || matches.includes(card.match)
                ? "bg-green-200"
                : "bg-white"
            } p-4 rounded-xl shadow text-center font-medium border`}
            whileTap={{ scale: 0.95 }}
          >
            {card.label}
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-4">
        <button
          onClick={resetGame}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Reset Game
        </button>
      </div>

      <div className="mt-6 border-t pt-6">
        <h2 className="text-xl font-semibold text-center">Admin Panel: Add New Pair</h2>
        <div className="flex justify-center gap-4 mt-4 flex-wrap">
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Term"
            className="border p-2 rounded"
          />
          <input
            value={match}
            onChange={(e) => setMatch(e.target.value)}
            placeholder="Match"
            className="border p-2 rounded"
          />
          <select
            value={adminCategory}
            onChange={(e) => setAdminCategory(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="dotnet">.NET</option>
            <option value="java">Java</option>
            <option value="cloud">AWS & Azure</option>
            <option value="api">API</option>
          </select>
          <button
            onClick={handleAddPair}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add
          </button>
        </div>
      </div>

      {showHelp && (
        <div
          id="modal-bg"
          onClick={closeModal}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg text-center space-y-4">
            <h2 className="text-xl font-bold">How to Play</h2>
            <ul className="text-left list-disc list-inside space-y-2 text-gray-700">
              <li>Select a category to focus (e.g., .NET, Java, API, Cloud).</li>
              <li>Click on two cards to try matching related terms.</li>
              <li>Matched cards turn green and stay visible.</li>
              <li>Use the Admin Panel to add custom tech pairs.</li>
              <li>Click “Reset Game” to reshuffle the board.</li>
            </ul>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
