import { requireRole } from "@/lib/auth/guards";
import { notFound } from "next/navigation";
import {
  getEmployeeById,
  listEmployeeDocuments,
  listEmployeeTrainings,
  listEmployeeNotes,
  listEmployeeCertifications,
  listCompensationHistory,
  listEmployeeAssignments,
  listEmployeeBriefs,
  listEmployeeAvailability,
  listEmployeeTimesheets,
} from "@/lib/db/employees";
import { EmployeeDossier } from "./EmployeeDossier";

export default async function PatronEmployeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("patron");
  const { id } = await params;
  const [
    employee,
    documents,
    trainings,
    notes,
    certifications,
    compensationHistory,
    assignments,
    briefs,
    availability,
    timesheets,
  ] = await Promise.all([
    getEmployeeById(id),
    listEmployeeDocuments(id),
    listEmployeeTrainings(id),
    listEmployeeNotes(id),
    listEmployeeCertifications(id),
    listCompensationHistory(id),
    listEmployeeAssignments(id),
    listEmployeeBriefs(id),
    listEmployeeAvailability(id),
    listEmployeeTimesheets(id, { limit: 30 }),
  ]);
  if (!employee) notFound();
  return (
    <EmployeeDossier
      employee={employee}
      documents={documents}
      trainings={trainings}
      notes={notes}
      certifications={certifications}
      compensationHistory={compensationHistory}
      assignments={assignments}
      briefs={briefs}
      availability={availability}
      timesheets={timesheets}
    />
  );
}
