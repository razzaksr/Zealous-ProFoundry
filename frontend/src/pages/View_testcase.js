import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography ,Paper} from "@mui/material";
import axios from "axios";
import Admin_Dashboard from "../components/AdminDash";

const TestcaseGrid = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/testcase/get_all_testCases")
      .then((res) => {
        const formattedRows = res.data.map((item) => ({
          id: item._id,
          testcase_id: item.testcase_id,
          input: item.testcase_input.join(", "),
          output: item.testcase_output.join(", "),
          tags: item.testcase_tags.join(", "),
          createdAt: new Date(item.createdAt).toLocaleString(),
          updatedAt: new Date(item.updatedAt).toLocaleString()
        }));
        setRows(formattedRows);
      })
      .catch((err) => console.error("Failed to fetch test cases:", err));
  }, []);

  const columns = [
    { field: "testcase_id", headerName: "Testcase ID", width: 250 },
    { field: "input", headerName: "Input", width: 200 },
    { field: "output", headerName: "Output", width: 200 },
    { field: "tags", headerName: "Tags", width: 300 },
    { field: "createdAt", headerName: "Created At", width: 180 },
    { field: "updatedAt", headerName: "Updated At", width: 180 }
  ];

  return (
   <>
    <Admin_Dashboard />
    <Box sx={{ padding: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
        Test Case Management
      </Typography>
      <Paper elevation={3} sx={{ p: 2, borderRadius: '16px' }}>
        <Box sx={{ height: 600, width: '100%' }}>
 <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 20]}
          getRowId={(row) => row.id}
        />
                 </Box>
      </Paper>
    </Box>
   </>
  );
};

export default TestcaseGrid;
