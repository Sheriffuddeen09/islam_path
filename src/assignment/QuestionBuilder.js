export default function QuestionBuilder({ index, question, setQuestions, setErrors }) {
  // Update a specific field of the question
  const update = (field, value) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });

     setErrors(prev => ({ ...prev, questions: "" }));
  };

  return (
    <div className="border p-3 rounded mt-4 bg-white">
      <p className="font-semibold">Question {index + 1}</p>

      <textarea
        className="input w-full mt-1 p-2 border rounded"
        placeholder="Question"
        value={question.question}
        onChange={e => update("question", e.target.value)}
      />

      {["A", "B", "C", "D"].map(opt => (
        <input
          key={opt}
          className="input w-full mt-1 p-2 border rounded"
          placeholder={`Option ${opt}`}
          value={question[opt]}
          onChange={e => update(opt, e.target.value)}
        />
      ))}

      <select
        className="input w-full mt-2 p-2 border rounded"
        value={question.answer}
        onChange={e => update("answer", e.target.value)}
      >
        <option value="">Correct Answer</option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
      </select>
    </div>
  );
}
