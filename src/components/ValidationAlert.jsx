export default function ValidationAlert({ validation }) {
  if (!validation || validation.is_valid) {
    return null;
  }

  return (
    <div className="alert warning">
      <h4>Input Needs More Details Before Report Draft</h4>
      {validation.notes && <p>{validation.notes}</p>}
      {validation.missing_fields.length > 0 && (
        <p>
          Missing fields: {validation.missing_fields.join(", ")}
        </p>
      )}
      {validation.clarification_questions.length > 0 && (
        <p>
          Questions: {validation.clarification_questions.join(" | ")}
        </p>
      )}
    </div>
  );
}
