import {
  Document,
  Page,
  Text,
  View,
  StyleSheet
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 11,
    fontFamily: "Helvetica"
  },

  header: {
    marginBottom: 15,
    borderBottom: "2 solid #0f766e",
    paddingBottom: 8
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f766e"
  },

  meta: {
    marginTop: 6,
    fontSize: 11
  },

  scoreBox: {
    marginVertical: 12,
    padding: 10,
    backgroundColor: "#f0fdfa",
    borderRadius: 6
  },

  questionBox: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: "1 solid #ddd"
  },

  question: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4
  },

  option: {
    marginLeft: 10,
    marginTop: 2
  },

  correct: {
    color: "green",
    fontWeight: "bold"
  },

  wrong: {
    color: "red",
    fontWeight: "bold"
  },

  correctHint: {
    marginLeft: 14,
    marginTop: 4,
    color: "green",
    fontSize: 10
  }
});

export default function AssignmentResultPDF({ result }) {
  const percentage =
    ((result.score / result.total_questions) * 100).toFixed(2);

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {result.assignment.title}
          </Text>

          <Text style={styles.meta}>
            Teacher: {result.assignment.teacher.first_name}{" "}
            {result.assignment.teacher.last_name}
          </Text>

          <Text style={styles.meta}>
            Student: {result.student.first_name}{" "}
            {result.student.last_name}
          </Text>
        </View>

        {/* SCORE */}
        <View style={styles.scoreBox}>
          <Text>
            Score: {result.score} / {result.total_questions}
          </Text>
          <Text>Percentage: {percentage}%</Text>
        </View>

        {/* QUESTIONS */}
        {result.assignment.questions.map((q, index) => {
          const answer = result.answers.find(
            a => a.question_id === q.id
          );

          return (
            <View key={q.id} style={styles.questionBox}>
              <Text style={styles.question}>
                {index + 1}. {q.question}
              </Text>

              {["A", "B", "C", "D"].map(opt => {
                const isCorrect = q.correct_answer === opt;
                const isChosen = answer?.selected_answer === opt;

                let optionStyle = styles.option;

                if (isCorrect) optionStyle = [styles.option, styles.correct];
                if (isChosen && !isCorrect)
                  optionStyle = [styles.option, styles.wrong];

                return (
                  <Text key={opt} style={optionStyle}>
                    {opt}. {q[`option_${opt.toLowerCase()}`]}
                  </Text>
                );
              })}

              {/* SHOW CORRECT ANSWER IF WRONG */}
              {answer &&
                answer.selected_answer !== q.correct_answer && (
                  <Text style={styles.correctHint}>
                    Correct Answer: {q.correct_answer}.{" "}
                    {q[
                      `option_${q.correct_answer.toLowerCase()}`
                    ]}
                  </Text>
                )}
            </View>
          );
        })}
      </Page>
    </Document>
  );
}
