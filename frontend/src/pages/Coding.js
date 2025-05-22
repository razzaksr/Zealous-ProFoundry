import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography ,Paper} from "@mui/material";
import axios from "axios";
import Admin_Dashboard from "../components/AdminDash";

const Codingpage = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/coding/get_allCodes")
      .then((response) => {
        const codesArray = response.data.codes;
        if (!Array.isArray(codesArray)) {
          console.error("Data is not an array:", codesArray);
          return;
        }

        const formattedRows = codesArray.map((item) => ({
          id: item._id,
          code_id: item.code_id,
          problem: item.code_problem_statement,
          testCases: (item.code_test_cases_id || []).join(", "),
          tags: (item.code_tags || []).join(", "),
          createdAt: new Date(item.createdAt).toLocaleString(),
          updatedAt: new Date(item.updatedAt).toLocaleString(),
        }));
        setRows(formattedRows);
      })
      .catch((error) => console.error("Error fetching code data:", error));
  }, []);

  const columns = [
    { field: "code_id", headerName: "Code ID", width: 200 },
    { field: "problem", headerName: "Problem Statement", width: 300 },
    { field: "testCases", headerName: "Test Cases ID", width: 250 },
    { field: "tags", headerName: "Tags", width: 200 },
    { field: "createdAt", headerName: "Created At", width: 180 },
    { field: "updatedAt", headerName: "Updated At", width: 180 },
  ];

  return (
    <>
       <Admin_Dashboard />
    <Box sx={{ padding: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
        Coding Management
      </Typography>
      <Paper elevation={3} sx={{ p: 2, borderRadius: '16px' }}>
        <Box sx={{ height: 600, width: '100%' }}>
 <DataGrid
              rows={rows}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 20, 50]}
              getRowId={(row) => row.id}
            />
                 </Box>
      </Paper>
    </Box>
    </>
  );
};

export default Codingpage;
