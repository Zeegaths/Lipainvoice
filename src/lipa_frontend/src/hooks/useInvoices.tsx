import { useQuery } from "@tanstack/react-query"

type Invoice = {
  id: number;
  taskId: number | null;
  client: string;
  amount: number;
  status: string;
  date: string
}

export default function useInvoices() {
  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => getAllInvoices(),
  })

  return { invoices, isLoading, error }
}

async function getAllInvoices(): Promise<Invoice[]> {
  return MOCK_INVOICES
}




const MOCK_INVOICES = [
  { id: 101, taskId: 2, client: 'TechStart', amount: 0.005, status: 'paid', date: '2025-07-25' },
  { id: 102, taskId: 3, client: 'FitLife', amount: 0.008, status: 'pending', date: '2025-07-22' },
  { id: 103, taskId: 6, client: 'Travel Agency', amount: 0.003, status: 'paid', date: '2025-07-29' },
  { id: 104, taskId: null, client: 'Creative Studio', amount: 0.0115, status: 'pending', date: '2025-07-20' },
  { id: 105, taskId: null, client: 'Local Restaurant', amount: 0.0028, status: 'paid', date: '2025-07-15' },
  { id: 106, taskId: 8, client: 'Handmade Crafts', amount: 0.0042, status: 'pending', date: '2025-08-01' },
  { id: 107, taskId: null, client: 'Tech Conference', amount: 0.0135, status: 'pending', date: '2025-07-18' }
]
