"use client";

import { useEffect, useState } from 'react';
import { getServiceListings, ServiceListing } from '@/services/service-listings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"

export default function Home() {
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    const fetchListings = async () => {
      const data = await getServiceListings();
      setListings(data);
    };

    fetchListings();
  }, []);

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
       <Toaster />
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-semibold tracking-tight">SkillHub Connect</h1>
          <Input
            type="search"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm rounded-md shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
          />
      </header>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <ScrollArea className="h-[600px] w-full rounded-md border shadow-sm">
        {filteredListings.map(listing => (
          <Card key={listing.id} className="border-none shadow-md transition-colors hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{listing.title}</CardTitle>
              <CardDescription className="text-muted-foreground">{listing.category}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{listing.description}</p>
              <p>
                <span className="font-medium">Rate:</span> ${listing.rate}/hr
              </p>
              <p>
                <span className="font-medium">Availability:</span> {listing.availability.join(', ')}
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full rounded-md shadow-sm">Book Service</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-md shadow-lg">
                  <DialogHeader>
                    <DialogTitle>Book {listing.title}</DialogTitle>
                    <DialogDescription>
                      Make a booking request to schedule this service.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value="John Doe" className="col-span-3 rounded-md shadow-sm focus-visible:ring-2 focus-visible:ring-primary" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="username">Select Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] justify-start text-left font-normal rounded-md shadow-sm",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-md shadow-md" align="start" side="bottom">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="comment">Comment</Label>
                      <Textarea id="comment" className="col-span-3 rounded-md shadow-sm focus-visible:ring-2 focus-visible:ring-primary" />
                    </div>
                  </div>
                  <Button onClick={() => toast({
                    title: "Success!",
                    description: "Your booking request has been sent.",
                  })} type="submit" className="w-full rounded-md shadow-sm">Make booking request</Button>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
        </ScrollArea>
      </div>
    </div>
  );
}
