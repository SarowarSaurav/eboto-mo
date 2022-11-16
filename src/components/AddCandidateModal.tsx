import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { forwardRef, useEffect, useState } from "react";
import {
  affiliationType,
  candidateType,
  electionType,
  partylistType,
  positionType,
} from "../types/typings";
import { v4 as uuidv4 } from "uuid";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import capitalizeFirstLetter from "../utils/capitalizeFirstLetter";
import ReactDatePicker from "react-datepicker";

const AddCandidateModal = ({
  isOpen,
  onClose,
  election,
  partylists,
  position,
}: {
  isOpen: boolean;
  onClose: () => void;
  election: electionType;
  partylists: partylistType[];
  position: positionType;
}) => {
  const clearForm = () => {
    setCandidate({
      firstName: "",
      middleName: "",
      lastName: "",
      photoUrl: "",
      partylist: "",
      id: uuidv4(),
      uid: "",
      position: position?.uid,
      votingCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),

      credentials: {
        achievements: [],
        affiliations: [],
        seminarsAttended: [],
      },
    });
  };
  const [candidate, setCandidate] = useState<candidateType>({
    firstName: "",
    middleName: "",
    lastName: "",
    photoUrl: "",
    partylist: "",
    id: uuidv4(),
    uid: "",
    position: position?.uid,
    votingCount: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),

    credentials: {
      achievements: [],
      affiliations: [],
      seminarsAttended: [],
    },
  });
  const [loading, setLoading] = useState(false);
  console.log(candidate.credentials.affiliations);
  useEffect(() => {
    clearForm();
    setLoading(false);
  }, [isOpen]);
  return (
    <Modal isOpen={isOpen} onClose={onClose} trapFocus={false} size="4xl">
      <ModalOverlay />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          await addDoc(
            collection(firestore, "elections", election.uid, "candidates"),
            {
              ...candidate,
              firstName: capitalizeFirstLetter(candidate.firstName),

              middleName: candidate.middleName
                ? capitalizeFirstLetter(candidate.middleName)
                : "",
              lastName: capitalizeFirstLetter(candidate.lastName),
            }
          ).then(async (docRef) => {
            await updateDoc(
              doc(
                firestore,
                "elections",
                election.uid,
                "candidates",
                docRef.id
              ),
              {
                uid: docRef.id,
              }
            );
          });
          await updateDoc(doc(firestore, "elections", election.uid), {
            updatedAt: Timestamp.now(),
          });
          onClose();
          setLoading(false);
        }}
      >
        <ModalContent>
          <ModalHeader>Add a candidate</ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <Flex gap={4} flexDirection={["column", "column", "row"]}>
              <Stack spacing={4} flex={1}>
                <FormControl isRequired>
                  <FormLabel>First name</FormLabel>
                  <Input
                    placeholder="Candidate first name"
                    onChange={(e) =>
                      setCandidate({
                        ...candidate,
                        firstName: e.target.value,
                      })
                    }
                    value={candidate.firstName}
                    disabled={loading}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Middle name</FormLabel>
                  <Input
                    placeholder="Candidate middle name"
                    onChange={(e) =>
                      setCandidate({
                        ...candidate,
                        middleName: e.target.value,
                      })
                    }
                    value={candidate.middleName}
                    disabled={loading}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Last name</FormLabel>
                  <Input
                    placeholder="Candidate last name"
                    onChange={(e) =>
                      setCandidate({ ...candidate, lastName: e.target.value })
                    }
                    value={candidate.lastName}
                    disabled={loading}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Partylist</FormLabel>
                  <Select
                    placeholder="Select partylist"
                    disabled={loading}
                    onChange={(e) => {
                      setCandidate({
                        ...candidate,
                        partylist: e.target.value,
                      });
                    }}
                    value={candidate.partylist}
                  >
                    {partylists?.map((partylist) => (
                      <option value={partylist.uid} key={partylist.id}>
                        {partylist.name} ({partylist.abbreviation})
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Position</FormLabel>
                  <Input value={position?.title} readOnly />
                </FormControl>
                <FormControl>
                  <FormLabel>Image</FormLabel>
                  <Input type="file" accept="image/*" disabled={loading} />
                </FormControl>
              </Stack>
              <Stack flex={1} spacing={4}>
                <FormControl>
                  <FormLabel>Achievements</FormLabel>

                  <Stack>
                    {!candidate.credentials.achievements.length ? (
                      <Text>No achievements added</Text>
                    ) : (
                      candidate.credentials.achievements.map((achievement) => (
                        <FormControl key={achievement.id} isRequired>
                          <Flex justifyContent="space-between" gap={2}>
                            <Input
                              placeholder="Achievement title"
                              onChange={(e) =>
                                setCandidate({
                                  ...candidate,
                                  credentials: {
                                    ...candidate.credentials,
                                    achievements:
                                      candidate.credentials.achievements.map(
                                        (achievementToEdit) =>
                                          achievementToEdit.id ===
                                          achievement.id
                                            ? {
                                                ...achievementToEdit,
                                                title: e.target.value,
                                              }
                                            : achievementToEdit
                                      ),
                                  },
                                })
                              }
                              value={achievement.title}
                              disabled={loading}
                            />
                            <IconButton
                              aria-label="Remove achievement"
                              icon={<TrashIcon width={18} />}
                              onClick={() => {
                                setCandidate({
                                  ...candidate,
                                  credentials: {
                                    ...candidate.credentials,
                                    achievements:
                                      candidate.credentials.achievements.filter(
                                        (achievementToRemove) =>
                                          achievementToRemove.id !==
                                          achievement.id
                                      ),
                                  },
                                });
                              }}
                              disabled={loading}
                            />
                          </Flex>
                        </FormControl>
                      ))
                    )}
                    <Button
                      onClick={() => {
                        if (
                          candidate.credentials.achievements.length &&
                          candidate.credentials.achievements[
                            candidate.credentials.achievements.length - 1
                          ].title === ""
                        )
                          return;
                        setCandidate({
                          ...candidate,
                          credentials: {
                            ...candidate.credentials,
                            achievements: [
                              ...candidate.credentials.achievements,
                              {
                                id: uuidv4(),
                                title: "",
                              },
                            ],
                          },
                        });
                      }}
                      disabled={loading}
                      size="sm"
                    >
                      Add achievement
                    </Button>
                  </Stack>
                </FormControl>
              </Stack>
              <Stack flex={1} spacing={4}>
                <FormControl>
                  <FormLabel>Affiliations</FormLabel>
                  <Stack>
                    {!candidate.credentials.affiliations.length ? (
                      <Text>No affiliations added</Text>
                    ) : (
                      candidate.credentials.affiliations.map((affiliation) => (
                        <FormControl key={affiliation.id} isRequired>
                          <Stack>
                            <Flex justifyContent="space-between" gap={2}>
                              <Input
                                placeholder="Organization name"
                                onChange={(e) =>
                                  setCandidate({
                                    ...candidate,
                                    credentials: {
                                      ...candidate.credentials,
                                      affiliations:
                                        candidate.credentials.affiliations.map(
                                          (affiliationToEdit) =>
                                            affiliationToEdit.id ===
                                            affiliation.id
                                              ? {
                                                  ...affiliationToEdit,
                                                  organizationName:
                                                    e.target.value,
                                                }
                                              : affiliationToEdit
                                        ),
                                    },
                                  })
                                }
                                value={affiliation.organizationName}
                              />
                              <IconButton
                                aria-label="Remove affiliation"
                                icon={<TrashIcon width={18} />}
                                onClick={() => {
                                  setCandidate({
                                    ...candidate,
                                    credentials: {
                                      ...candidate.credentials,
                                      affiliations:
                                        candidate.credentials.affiliations.filter(
                                          (affiliationToRemove) =>
                                            affiliationToRemove.id !==
                                            affiliation.id
                                        ),
                                    },
                                  });
                                }}
                              />
                            </Flex>
                            <Input
                              placeholder="Position in the organization"
                              onChange={(e) =>
                                setCandidate({
                                  ...candidate,
                                  credentials: {
                                    ...candidate.credentials,
                                    affiliations:
                                      candidate.credentials.affiliations.map(
                                        (affiliationToEdit) =>
                                          affiliationToEdit.id ===
                                          affiliation.id
                                            ? {
                                                ...affiliationToEdit,
                                                position: e.target.value,
                                              }
                                            : affiliationToEdit
                                      ),
                                  },
                                })
                              }
                              value={affiliation.position}
                            />
                            <Flex gap={2} flex={1}>
                              <ReactDatePicker
                                selected={affiliation.startDate?.toDate()}
                                onChange={(date) =>
                                  date &&
                                  setCandidate({
                                    ...candidate,
                                    credentials: {
                                      ...candidate.credentials,
                                      affiliations:
                                        candidate.credentials.affiliations.map(
                                          (affiliationToEdit) =>
                                            affiliationToEdit.id ===
                                            affiliation.id
                                              ? {
                                                  ...affiliationToEdit,
                                                  startDate:
                                                    Timestamp.fromDate(date),
                                                }
                                              : affiliationToEdit
                                        ),
                                    },
                                  })
                                }
                                showYearPicker
                                dateFormat="yyyy"
                                placeholderText="Start date"
                              />
                              <ReactDatePicker
                                selected={affiliation.endDate?.toDate()}
                                onChange={(date) =>
                                  date &&
                                  setCandidate({
                                    ...candidate,
                                    credentials: {
                                      ...candidate.credentials,
                                      affiliations:
                                        candidate.credentials.affiliations.map(
                                          (affiliationToEdit) =>
                                            affiliationToEdit.id ===
                                            affiliation.id
                                              ? {
                                                  ...affiliationToEdit,
                                                  endDate:
                                                    Timestamp.fromDate(date),
                                                }
                                              : affiliationToEdit
                                        ),
                                    },
                                  })
                                }
                                showYearPicker
                                dateFormat="yyyy"
                                placeholderText="End date"
                                disabled={!affiliation.startDate?.toDate()}
                                minDate={affiliation.startDate?.toDate()}
                              />
                            </Flex>
                          </Stack>
                        </FormControl>
                      ))
                    )}
                    <Button
                      onClick={() => {
                        setCandidate({
                          ...candidate,
                          credentials: {
                            ...candidate.credentials,
                            affiliations: [
                              ...candidate.credentials.affiliations,
                              {
                                id: uuidv4(),
                                organizationName: "",
                                position: "",
                                startDate: null,
                                endDate: null,
                              },
                            ],
                          },
                        });
                      }}
                      disabled={loading}
                      size="sm"
                    >
                      Add affiliation
                    </Button>
                  </Stack>
                </FormControl>
                <FormControl>
                  <FormLabel>Seminars Attended</FormLabel>
                  <Stack>
                    {!candidate.credentials.seminarsAttended.length ? (
                      <Text>No seminars attended added</Text>
                    ) : (
                      candidate.credentials.seminarsAttended.map(
                        (seminarsAttended) => (
                          <FormControl key={seminarsAttended.id} isRequired>
                            <Flex justifyContent="space-between" gap={2}>
                              <Input
                                placeholder="Seminar attended title"
                                onChange={(e) =>
                                  setCandidate({
                                    ...candidate,
                                    credentials: {
                                      ...candidate.credentials,
                                      seminarsAttended:
                                        candidate.credentials.seminarsAttended.map(
                                          (seminarsAttendedToEdit) =>
                                            seminarsAttendedToEdit.id ===
                                            seminarsAttended.id
                                              ? {
                                                  ...seminarsAttended,
                                                  name: e.target.value,
                                                }
                                              : seminarsAttended
                                        ),
                                    },
                                  })
                                }
                                value={seminarsAttended.name}
                                disabled={loading}
                              />
                              <IconButton
                                aria-label="Remove seminar attended"
                                icon={<TrashIcon width={18} />}
                                onClick={() => {
                                  setCandidate({
                                    ...candidate,
                                    credentials: {
                                      ...candidate.credentials,
                                      seminarsAttended:
                                        candidate.credentials.seminarsAttended.filter(
                                          (seminarsAttendedToRemove) =>
                                            seminarsAttendedToRemove.id !==
                                            seminarsAttended.id
                                        ),
                                    },
                                  });
                                }}
                                disabled={loading}
                              />
                            </Flex>
                          </FormControl>
                        )
                      )
                    )}
                    <Button
                      onClick={() => {
                        setCandidate({
                          ...candidate,
                          credentials: {
                            ...candidate.credentials,
                            seminarsAttended: [
                              ...candidate.credentials.seminarsAttended,
                              {
                                id: uuidv4(),
                                name: "",
                                startDate: null,
                                endDate: null,
                              },
                            ],
                          },
                        });
                      }}
                      disabled={loading}
                      size="sm"
                    >
                      Add seminar added
                    </Button>
                  </Stack>
                </FormControl>
              </Stack>
            </Flex>
          </ModalBody>

          <ModalFooter justifyContent="space-between">
            <Box>
              {(candidate.firstName ||
                candidate.middleName ||
                candidate.lastName ||
                candidate.partylist) && (
                <Tooltip label="Clear forms">
                  <IconButton
                    aria-label="Clear form"
                    icon={<TrashIcon width={18} />}
                    onClick={() => {
                      clearForm();
                    }}
                    disabled={loading}
                  />
                </Tooltip>
              )}
            </Box>
            <Box>
              <Button
                colorScheme="blue"
                mr={3}
                type="submit"
                isLoading={loading}
                disabled={
                  !candidate.firstName ||
                  !candidate.lastName ||
                  !candidate.partylist
                }
              >
                Save
              </Button>
              <Button onClick={onClose} disabled={loading}>
                Cancel
              </Button>
            </Box>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
};

export default AddCandidateModal;

import React from "react";
