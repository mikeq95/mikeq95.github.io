import React from 'react';

export function Callout({ title, children }) {
  return (
    <div className="alert alert--secondary">
      {title && <strong>{title}</strong>}
      <div>{children}</div>
    </div>
  );
}

export function SpecTable({ columns, data }) {
  return (
    <table>
      <thead>
        <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row[0]}>{row.map((cell, index) => <td key={`${row[0]}-${index}`}>{cell}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

export function FeatureList({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.label || item.title}>
          {item.icon && `${item.icon} `}<strong>{item.label || item.title}</strong>
          {item.value && `：${item.value}`}
          {item.description && `：${item.description}`}
        </li>
      ))}
    </ul>
  );
}

export function Cards({ children }) {
  return <div className="row">{children}</div>;
}
