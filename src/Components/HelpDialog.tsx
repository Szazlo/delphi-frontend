import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircleQuestion, ChevronDown, ChevronUp } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useState } from "react";

const HelpDialog = () => {
    const [openGroups, setOpenGroups] = useState(false);
    const [openAssignments, setOpenAssignments] = useState(false);
    const [openResults, setOpenResults] = useState(false);
    const [openRequests, setOpenRequests] = useState(false);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="text-gray-300 w-min p-0 border-0">
                    Help Center
                    <MessageCircleQuestion className="rounded-full" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-300">Help Center</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Common questions and helpful information about using the application.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-2">
                    <h1 className="text-lg font-semibold text-gray-300">Getting Started</h1>

                    <Collapsible open={openGroups} onOpenChange={setOpenGroups} className="border border-gray-700 rounded-md p-2">
                        <CollapsibleTrigger className="flex items-center justify-between w-full">
                            <span className="font-medium">Groups</span>
                            {openGroups ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2 space-y-2">
                            <p>Groups are a way to organize your assignments and submissions.</p>

                            <p className="font-bold mt-2">Users/Students</p>
                            <p className="text-gray-500">
                                You can join a group using an invite link or code (provided by your
                                educator).<br/>
                                OR<br/>
                                You will be added to a group by your educator, in which case your groups
                                will be visible on the Dashboard and Groups pages.
                            </p>

                            <p className="font-bold mt-2">Educators</p>
                            <p className="text-gray-500">
                                You can create a group and invite students to join using an invite link or code
                                (this is the group ID visible in the URL of the group i.e. /groups/b238dd76-f941-4d1e-8ff3-f85561416634)<br/>
                                OR<br/>
                                You can add students to a group in the group's page using the Users Management Table.
                            </p>
                        </CollapsibleContent>
                    </Collapsible>

                    <Collapsible open={openAssignments} onOpenChange={setOpenAssignments} className="border border-gray-700 rounded-md p-2">
                        <CollapsibleTrigger className="flex items-center justify-between w-full">
                            <span className="font-medium">Assignments</span>
                            {openAssignments ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2 space-y-2">
                            <p>
                                Assignments are tasks or exercises that students need to complete and submit.
                                These are then analyzed and graded by the system/educator.
                            </p>

                            <p className="font-bold mt-2">Creating an Assignment</p>
                            <p className="text-gray-500">
                                Educators can create assignments in the Assignments or Group's page.
                                When creating an assignment, include all details in its description including
                                submission instructions, and if the assignment has test cases,
                                examples of expected input/output.
                            </p>

                            <p className="font-bold mt-2">Submitting an Assignment</p>
                            <p className="text-gray-500">
                                Students can view their assignments on the Dashboard, Assignments and Group's page.
                                For the submission, upload a .zip file of the project's source directory
                                (folder including the entry point file).
                                The project's entry point file should be named main.py OR the .zip
                                must be named after the entry point file.
                            </p>
                        </CollapsibleContent>
                    </Collapsible>

                    <Collapsible open={openResults} onOpenChange={setOpenResults} className="border border-gray-700 rounded-md p-2">
                        <CollapsibleTrigger className="flex items-center justify-between w-full">
                            <span className="font-medium">Results</span>
                            {openResults ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2">
                            <p>
                                The results page shows a table of all of your previous submissions
                                (from all assignments).
                            </p>
                        </CollapsibleContent>
                    </Collapsible>

                    <Collapsible open={openRequests} onOpenChange={setOpenRequests} className="border border-gray-700 rounded-md p-2">
                        <CollapsibleTrigger className="flex items-center justify-between w-full">
                            <span className="font-medium">Requests</span>
                            {openRequests ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2 space-y-2">
                            <p>
                                Requests page is where you view and manage peer-review requests.
                                It shows two tables, one for requests you have made and one for requests
                                assigned to you.
                            </p>

                            <p className="font-bold mt-2">Creating a Request</p>
                            <p className="text-gray-500">
                                Students can create a request for review from their submission's page.
                            </p>

                            <p className="font-bold mt-2">Reviewing a Request</p>
                            <p className="text-gray-500">
                                Educators can view and manage requests on the Requests page.
                                Requests will give access to the submission and allow you to provide feedback.
                                Feedback can be given through inline comments on files in the editor on the
                                submission's page.
                            </p>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default HelpDialog;