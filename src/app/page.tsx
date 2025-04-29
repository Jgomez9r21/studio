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
import { CalendarIcon, Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Home, Users, Settings, CreditCard, UserPlus, Briefcase } from "lucide-react";

const categories = [
  'All',
  'Sports',
  'Education',
  'Technology',
  'Home Maintenance',
  'Design',
];

const navigation = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Find Talents",
    href: "/find-talents",
    icon: Users,
  },
  {
    title: "Post a Job",
    href: "/post-job",
    icon: UserPlus,
  },
  {
    title: "Book a Service",
    href: "/book-service",
    icon: Briefcase,
  },
  {
    title: "Billing",
    href: "/billing",
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function HomePage() {
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchListings = async () => {
      const data = await getServiceListings();
      setListings(data);
    };

    fetchListings();
  }, []);

  const filteredListings = listings.filter(listing =>
    (selectedCategory === 'All' || listing.category === selectedCategory) &&
    (listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <SidebarProvider>
      <Sidebar className="w-60">
        <SidebarHeader>
          <Avatar className="ml-2">
            <AvatarImage src="https://picsum.photos/50/50" alt="SkillHub Connect" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-bold">SkillHub Connect</h2>
          <p className="text-sm text-muted-foreground">
            Find local talents and services
          </p>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarMenu>
            {navigation.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator />
          <p className="text-xs text-muted-foreground px-2">
            © {new Date().getFullYear()} SkillHub Connect
          </p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="container mx-auto p-6">
          <Toaster />

          {/* Hero Section */}
          <section className="mb-12 flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              Find the Perfect Service Provider
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Book local services with ease.
            </p>
            <div className="relative mt-6 w-full max-w-md">
              <Input
                type="search"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-md shadow-sm focus-visible:ring-2 focus-visible:ring-primary pr-10"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          </section>

          {/* Category Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-[repeat(auto-fit,minmax(100px,1fr))]">
              {categories.map(category => (
                <TabsTrigger value={category.toLowerCase()} key={category} onClick={() => setSelectedCategory(category)}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Service Listings */}
            {categories.map(category => (
              <TabsContent value={category.toLowerCase()} key={category} className="mt-8">
                <ScrollArea className="h-[600px] w-full rounded-md border shadow-sm">
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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

                          {/* Booking Dialog */}
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
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
