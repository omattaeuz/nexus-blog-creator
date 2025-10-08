import React, { useEffect, useRef } from 'react';

interface NotionTableProps {
  tableId: string;
  onUpdate?: (html: string) => void;
}

export default function NotionTable({ tableId, onUpdate }: NotionTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tableRef.current) return;

    const handleTableControls = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.classList.contains('notion-menu-btn')) return;

      e.preventDefault();
      e.stopPropagation();

      const action = target.getAttribute('data-action');
      const table = tableRef.current?.querySelector('.notion-table');

      if (!table) return;

      const tbody = table.querySelector('tbody');
      if (!tbody) return;

      const rows = Array.from(tbody.querySelectorAll('tr'));
      const cols = rows[0]?.querySelectorAll('td').length || 0;

      switch (action) {
        case 'add-row-above':
          addTableRow(tbody, rows[0], cols);
          break;
        case 'add-row-below':
          addTableRow(tbody, rows[rows.length - 1], cols, true);
          break;
        case 'delete-row':
          if (rows.length > 1) {
            rows[rows.length - 1].remove();
          }
          break;
        case 'add-col-left':
          addTableColumn(tbody, 0, rows.length);
          break;
        case 'add-col-right':
          addTableColumn(tbody, cols, rows.length);
          break;
        case 'delete-col':
          if (cols > 1) {
            rows.forEach(row => {
              const cells = row.querySelectorAll('td');
              if (cells[cells.length - 1]) {
                cells[cells.length - 1].remove();
              }
            });
          }
          break;
      }

      // Notify parent of changes
      if (onUpdate && tableRef.current) {
        onUpdate(tableRef.current.outerHTML);
      }
    };

    const addTableRow = (tbody: Element, referenceRow: Element, colCount: number, after = false) => {
      const newRow = document.createElement('tr');

      for (let i = 0; i < colCount; i++) {
        const cell = document.createElement('td');
        cell.className = 'notion-cell';
        cell.contentEditable = 'true';
        newRow.appendChild(cell);
      }

      if (after) {
        tbody.appendChild(newRow);
      } else {
        tbody.insertBefore(newRow, referenceRow);
      }
    };

    const addTableColumn = (tbody: Element, colIndex: number, rowCount: number) => {
      const rows = Array.from(tbody.querySelectorAll('tr'));
      rows.forEach(row => {
        const cell = document.createElement('td');
        cell.className = 'notion-cell';
        cell.contentEditable = 'true';

        const cells = row.querySelectorAll('td');
        if (colIndex >= cells.length) {
          row.appendChild(cell);
        } else {
          row.insertBefore(cell, cells[colIndex]);
        }
      });
    };

    const tableElement = tableRef.current;
    tableElement.addEventListener('click', handleTableControls);

    return () => {
      tableElement.removeEventListener('click', handleTableControls);
    };
  }, [onUpdate]);

  return (
    <>
      <div 
        ref={tableRef}
        className="notion-table-block" 
        data-table-id={tableId} 
        contentEditable={false}
      >
        <div className="notion-table-container">
          <table className="notion-table">
            <tbody>
              <tr>
                <td className="notion-cell" contentEditable={true}></td>
                <td className="notion-cell" contentEditable={true}></td>
              </tr>
              <tr>
                <td className="notion-cell" contentEditable={true}></td>
                <td className="notion-cell" contentEditable={true}></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="notion-table-menu">
          <button className="notion-menu-btn" data-action="add-row-above" title="Add row above">⬆️</button>
          <button className="notion-menu-btn" data-action="add-row-below" title="Add row below">⬇️</button>
          <button className="notion-menu-btn" data-action="add-col-left" title="Add column left">⬅️</button>
          <button className="notion-menu-btn" data-action="add-col-right" title="Add column right">➡️</button>
          <div className="notion-menu-divider"></div>
          <button className="notion-menu-btn danger" data-action="delete-row" title="Delete row">🗑️</button>
          <button className="notion-menu-btn danger" data-action="delete-col" title="Delete column">🗑️</button>
        </div>
      </div>
      
      <style jsx>{`
        .notion-table-block {
          margin: 16px 0;
          position: relative;
          border: 2px solid #000000;
          border-radius: 6px;
          background: #ffffff;
          overflow: hidden;
        }
        .notion-table-container {
          overflow: auto;
          max-width: 100%;
        }
        .notion-table {
          width: 100%;
          border-collapse: collapse;
          background: #ffffff;
          table-layout: fixed;
          min-width: 300px;
        }
        .notion-table tr {
          border-bottom: 1px solid #000000;
        }
        .notion-table tr:last-child {
          border-bottom: none;
        }
        .notion-cell {
          border-right: 1px solid #000000;
          padding: 8px 12px;
          min-width: 120px;
          min-height: 36px;
          position: relative;
          vertical-align: top;
          background: #ffffff;
          transition: background-color 0.1s ease;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .notion-cell:last-child {
          border-right: none;
        }
        .notion-cell:focus {
          outline: none;
          background: #f3f4f6;
          box-shadow: inset 0 0 0 1px #3b82f6;
        }
        .notion-cell:hover {
          background: #f9fafb;
        }
        .notion-cell:empty:before {
          content: "Type here...";
          color: #9ca3af;
          pointer-events: none;
          font-style: italic;
        }
        .notion-table-menu {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #ffffff;
          border: 1px solid #000000;
          border-radius: 6px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 4px;
          display: none;
          flex-direction: row;
          gap: 2px;
          z-index: 1000;
          min-width: auto;
        }
        .notion-table-block:hover .notion-table-menu {
          display: flex;
        }
        .notion-menu-btn {
          padding: 6px;
          border: none;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          color: #374151;
          text-align: center;
          transition: background-color 0.1s ease;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .notion-menu-btn:hover {
          background: #f3f4f6;
        }
        .notion-menu-btn.danger {
          color: #dc2626;
        }
        .notion-menu-btn.danger:hover {
          background: #fef2f2;
        }
        .notion-menu-divider {
          width: 1px;
          background: #000000;
          margin: 0 2px;
        }
        .notion-cell[contenteditable="true"] {
          resize: none;
          overflow: hidden;
          min-height: 36px;
          max-height: 200px;
        }
        .notion-cell[contenteditable="true"]:focus {
          min-height: 50px;
        }
      `}</style>
    </>
  );
}