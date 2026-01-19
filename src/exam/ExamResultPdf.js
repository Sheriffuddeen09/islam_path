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


export default function ExamResultPDF({ result }) {

  
  const percentage =
    (result.score / result.total_questions) * 100

    const grade =
    percentage >= 75 ? "Excellent" :
    percentage >= 65 ? "Very Good" :
    percentage >= 50 ? "Good" :
    percentage >= 40 ? "Pass" : "Fail";

  const badgeCount =
    grade === "Excellent" ? 5 :
    grade === "Very Good" ? 3 :
    grade === "Good" ? 2 :
    grade === "Pass" ? 1 : 0;

  const gradeColor =
    grade === "Excellent" ? "text-green-600" :
    grade === "Very Good" ? "text-blue-600" :
    grade === "Good" ? "text-yellow-600" :
    grade === "Pass" ? "text-purple-600" : "text-red-600";

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* HEADER */}
        <View style={styles.header}>
                    <Text>
                      {result.exam.title}
                    </Text>
          
               
                              <Text style={
                                {
                                  fontSize: 14,
                                  fontWeight: "bold",
                                  color: "black",
                                  marginTop: 2,
                                  marginBottom: 2
                                }
                              } className={`text-4xl font-bold ${gradeColor}`}>
                                 {grade} Result 
                              </Text>
                              <Text style={
                                {
                                  fontSize: 12,
                                  fontWeight: "bold",
                                  color: "black",
                                  marginBottom: 2
                                }
                              } className="text-gray-900 text-lg font-bold mt-2">
                                {result.student.first_name} • {result.student.last_name} 
                              </Text>
                          
                      
                            {/* SCORE */}
                            
                               <Text style={
                                {
                                  fontSize: 11,
                                  fontWeight: "bold",
                                  color: "black",
                                  marginBottom: 2
                                }
                              } className="text-sm mt-2 text-black font-bold">
                                Earn: {badgeCount}
                                </Text>
                             
                              <Text 
                              style={
                                {
                                  fontSize: 14,
                                  fontWeight: "bold",
                                  color: "black",
                                  marginBottom: 2
                                }
                              } className="text-2xl text-black font-semibold">
                                Score: {result.score} / {result.total_questions}
                              </Text>
                              <Text style={
                                {
                                  fontSize: 14,
                                  fontWeight: "bold",
                                  color: "#0f766e",
                                  marginTop: 2,
                                  marginBottom: 2
                                }
                              } className="text-green-600 font-semibold mt-1">
                                Percentage: {percentage.toFixed(1)}%
                              </Text>
                             
                            
                    <Text style={styles.meta}>
                      Teacher: {result.exam.teacher.first_name}{" "}
                      {result.exam.teacher.last_name}
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
        {result.exam.questions.map((q, index) => {
          const answer = result.answers?.find(
                a => Number(a.question_id) === Number(q.id)
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
                    Correct Answer: {q.correct_answer}
                  </Text>
                )}
            </View>
          );
        })}
      </Page>
    </Document>
  );
}
