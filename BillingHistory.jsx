import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export default function BillingHistory({ transactions }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'succeeded':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50"><CheckCircle className="w-3 h-3 mr-1" /> Paid</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/50"><AlertCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="bg-slate-900/90 border-slate-800">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          Billing History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions && transactions.length > 0 ? (
          <div className="rounded-md border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-950">
                <TableRow>
                  <TableHead className="text-slate-400">Date</TableHead>
                  <TableHead className="text-slate-400">Description</TableHead>
                  <TableHead className="text-slate-400">Amount</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id} className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell className="text-slate-300 font-medium">
                      {format(new Date(tx.transaction_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {tx.description}
                      <div className="text-xs text-slate-500">{tx.payment_method_label}</div>
                    </TableCell>
                    <TableCell className="text-white font-bold">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: tx.currency || 'USD' }).format(tx.amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                    <TableCell className="text-right">
                      {tx.invoice_url && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-purple-400" onClick={() => window.open(tx.invoice_url, '_blank')}>
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-950/50 rounded-lg border border-dashed border-slate-800">
            <p className="text-slate-500">No billing history available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}