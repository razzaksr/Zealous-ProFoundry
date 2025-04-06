import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@mui/material";
import { Button } from "@mui/material";

const CodingTest = () => {
  const { testId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [codingIds, setCodingIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentCoding, setCurrentCoding] = useState(null);
  const [responses, setResponses] = useState({});
  const API_BASE_URL = "http://localhost:4000";

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/test_gateway/test/get_by_test_id/${testId}`);
        setCodingIds(res.data.test_coding_id || []);
      } catch (err) {
        console.error("Failed to fetch test data:", err);
      }
    };
    fetchTestData();
  }, [testId]);

  useEffect(() => {
    const fetchCurrentCoding = async () => {
      if (codingIds.length && currentIndex < codingIds.length) {
        try {
          const res = await axios.get(`/coding_gateway/coding/get_by_id/${codingIds[currentIndex]}`);
          setCurrentCoding(res.data);
        } catch (err) {
          console.error("Failed to fetch coding question:", err);
        }
      }
    };
    fetchCurrentCoding();
  }, [codingIds, currentIndex]);

  const handleCodeChange = (e) => {
    const { value } = e.target;
    if (currentCoding) {
      setResponses((prev) => ({
        ...prev,
        [currentCoding.coding_id]: value,
      }));
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < codingIds.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // All coding done - Submit or Navigate
      console.log("Test submitted:", {
        mcqAnswers: location.state?.mcqAnswers,
        codingAnswers: responses,
      });
      navigate("/test-summary", { state: { mcqAnswers: location.state?.mcqAnswers, codingAnswers: responses } });
    }
  };

  if (!currentCoding) return <div className="text-center mt-10">Loading coding task...</div>;

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50 p-6">
      <Card className="max-w-3xl w-full p-6 shadow-xl rounded-2xl">
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">Coding Problem {currentIndex + 1}</h2>
          <p className="mb-6 whitespace-pre-wrap">{currentCoding.coding_question}</p>

          <textarea
            value={responses[currentCoding.coding_id] || ""}
            onChange={handleCodeChange}
            className="w-full h-60 p-4 border border-gray-300 rounded-lg font-mono"
            placeholder="Write your code here..."
          />

          <div className="mt-6 flex justify-end">
            <Button onClick={handleNext} className="text-lg px-6 py-2">
              {currentIndex + 1 < codingIds.length ? "Next" : "Submit Test"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodingTest;
