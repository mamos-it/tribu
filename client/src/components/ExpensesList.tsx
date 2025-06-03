import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface ExpenseWithUser {
  id: number;
  name: string;
  amount: number;
  addedBy: number;
  addedByUser?: {
    id: number;
    name: string;
  };
}

interface ExpensesListProps {
  expenses: ExpenseWithUser[];
  eventId: number;
  userId: number;
  totalBudget: number;
  participantsCount: number;
}

const ExpensesList: React.FC<ExpensesListProps> = ({ 
  expenses, 
  eventId, 
  userId, 
  totalBudget,
  participantsCount
}) => {
  const { toast } = useToast();
  const [newExpense, setNewExpense] = useState({
    name: '',
    amount: ''
  });
  
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = totalBudget - totalExpenses;
  const percentSpent = totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0;
  
  const handleAddExpense = async () => {
    if (!newExpense.name || !newExpense.amount) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const amount = parseFloat(newExpense.amount);
      
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Errore",
          description: "Inserisci un importo valido",
          variant: "destructive"
        });
        return;
      }
      
      await apiRequest('POST', '/api/expenses', {
        eventId,
        name: newExpense.name,
        amount,
        addedBy: userId
      });
      
      toast({
        title: "Spesa aggiunta",
        description: "La spesa è stata aggiunta con successo"
      });
      
      setNewExpense({ name: '', amount: '' });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/expenses`] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/payment-summary`] });
      
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiungere la spesa",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Riepilogo spese</h3>
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-sm text-primary font-medium flex items-center">
                <i className="ri-add-line mr-1"></i>
                Aggiungi spesa
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Aggiungi una nuova spesa</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="expense-name">Nome spesa</Label>
                  <Input 
                    id="expense-name" 
                    placeholder="Es. Bevande" 
                    value={newExpense.name}
                    onChange={(e) => setNewExpense({...newExpense, name: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expense-amount">Importo (€)</Label>
                  <Input 
                    id="expense-amount" 
                    type="number" 
                    placeholder="0.00" 
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Annulla</Button>
                </DialogClose>
                <Button onClick={handleAddExpense}>Aggiungi</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="bg-neutral-100 rounded-lg p-6 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-neutral-500">Budget totale</span>
            <span className="font-medium">€{totalBudget.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-neutral-500">Spese registrate</span>
            <span className="font-medium">€{totalExpenses.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-neutral-500">Rimanente</span>
            <span className="font-medium text-primary">€{remainingBudget.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="w-full bg-neutral-200 rounded-full h-2 mb-1">
          <div 
            className="bg-primary h-2 rounded-full" 
            style={{ width: `${Math.min(percentSpent, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-neutral-400">
          <span>0%</span>
          <span>{percentSpent}% speso</span>
          <span>100%</span>
        </div>
      </div>
      
      <h3 className="text-lg font-medium mb-6 px-6">Lista spese</h3>
      
      {expenses.length === 0 ? (
        <div className="text-center py-12 px-6 text-neutral-500">
          <i className="ri-shopping-bag-line text-4xl mb-4 block opacity-50"></i>
          Nessuna spesa registrata
        </div>
      ) : (
        <>
          {expenses.map((expense, index) => (
            <div 
              key={expense.id}
              className={`${
                index < expenses.length - 1 ? 'border-b border-neutral-200' : ''
              } py-4 px-6 flex justify-between items-center`}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mr-3">
                  <i className="ri-shopping-bag-line text-neutral-500"></i>
                </div>
                <div>
                  <p className="font-medium">{expense.name}</p>
                  <p className="text-sm text-neutral-400">
                    Aggiunto da {expense.addedByUser?.name || 'Utente'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">€{expense.amount.toFixed(2)}</p>
                {participantsCount > 0 && (
                  <p className="text-xs text-neutral-400">
                    €{(expense.amount / participantsCount).toFixed(2)} / persona
                  </p>
                )}
              </div>
            </div>
          ))}
        </>
      )}
      
      <Dialog>
        <DialogTrigger asChild>
          <button className="mt-4 w-full py-3 border border-dashed border-neutral-300 rounded-lg text-neutral-500 flex items-center justify-center hover:bg-neutral-50">
            <i className="ri-add-line mr-2"></i>
            Aggiungi nuova spesa
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Aggiungi una nuova spesa</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="expense-name-modal">Nome spesa</Label>
              <Input 
                id="expense-name-modal" 
                placeholder="Es. Bevande" 
                value={newExpense.name}
                onChange={(e) => setNewExpense({...newExpense, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expense-amount-modal">Importo (€)</Label>
              <Input 
                id="expense-amount-modal" 
                type="number" 
                placeholder="0.00" 
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Annulla</Button>
            </DialogClose>
            <Button onClick={handleAddExpense}>Aggiungi</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpensesList;
