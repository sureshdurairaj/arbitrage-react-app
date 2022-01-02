import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useTable, useSortBy } from "react-table";

import makeData from "./makeData";

const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }
`;

function Table({ columns, data }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable(
    {
      columns,
      data
    },
    useSortBy
  );

  return (
    <>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                // Add the sorting props to control sorting. For this example
                // we can add them into the header props
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render("Header")}
                  {/* Add a sort direction indicator */}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? " 🔽"
                        : " 🔼"
                      : ""}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  // console.log(cell);
                  return (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <br />
      <div>Total results of {rows.length} rows</div>
    </>
  );
}

function App() {
  const [data, setData] = useState([]);
  const columns = React.useMemo(
    () => [
      {
        Header: "-",
        columns: [
          {
            Header: "Assets",
            accessor: "asset"
          }
        ]
      },
      {
        Header: "WazirX",
        columns: [
          {
            Header: "LTP",
            accessor: "ltpw"
          }
        ]
      },
      {
        Header: "BitBns",
        columns: [
          {
            Header: "LTP",
            accessor: "ltpb"
          }
        ]
      },
      {
        Header: "ZebPay",
        columns: [
          {
            Header: "LTP",
            accessor: "ltpz"
          }
        ]
      },
      {
        Header: "Arbitrages",
        columns: [
          {
            Header: "Rate Diff",
            accessor: "rateDiff"
          },
          {
            Header: "Percent Diff",
            accessor: "percentDiff"
          },
          {
            Header: "Trade",
            accessor: "tradeLinks",
            cell: (props) => {
              return props;
            }
          }
        ]
      }
    ],
    []
  );
  const getData = async () => {
    const data = await makeData();
    console.log("data", data);
    setData(data);
  };
  useEffect(() => {
    getData();
  }, []);
  return (
    <Styles>
      <Table columns={columns} data={data} />
    </Styles>
  );
}

export default App;
