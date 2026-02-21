import type { Org } from '@platform/devportal-base/types/api'
import type * as z from 'zod'
import { LIMIT_PAGINATION } from '@platform/devportal-base/const/pagination'
import { createOrgOptions, orgSchema } from '@platform/devportal-base/features/entity-manage/org/api/create-org'
import { organizationListInfiniteQueryOptions } from '@platform/devportal-base/features/entity-manage/org/api/fake-org-data'
import { updateOrgOptions } from '@platform/devportal-base/features/entity-manage/org/api/update-org'
import { updateOrgForOrgOptions } from '@platform/devportal-base/features/entity-manage/org/api/update-org-for-org'
import { Button } from '@platform/ui/components/ui/button'
import {
  Combobox,
  ComboboxClear,
  ComboboxContent,
  ComboboxControl,
  ComboboxEmpty,
  ComboboxIcon,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxValue,
} from '@platform/ui/components/ui/combobox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@platform/ui/components/ui/dialog'
import { useAppForm } from '@platform/ui/components/ui/form'
import { Input } from '@platform/ui/components/ui/input'
import { Textarea } from '@platform/ui/components/ui/textarea'
import { revalidateLogic } from '@tanstack/react-form'
import { useInfiniteQuery, useMutation } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

type CreateEditOrgDialogProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  row?: Org | null
}

export function CreateEditOrgDialog({ open, onOpenChange, row }: CreateEditOrgDialogProps) {
  const { t } = useTranslation()
  const { id: projectId } = useParams({ from: '/_protected-layout/_main-layout/$id/entity-manage/_entity-manage-layout/org' })

  const {
    data: orgInfiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...organizationListInfiniteQueryOptions(projectId, LIMIT_PAGINATION),
    // README: Override default enabled behavior
    // enabled: organizationListInfiniteQueryOptions(projectId, LIMIT_PAGINATION).enabled && <some_condition>,
  })

  const allOrgs = orgInfiniteData?.pages.flatMap(page => page.organizations) ?? []

  const listRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const hasNextPageRef = useRef(hasNextPage)
  const isFetchingNextPageRef = useRef(isFetchingNextPage)
  const fetchNextPageRef = useRef(fetchNextPage)

  useEffect(() => {
    hasNextPageRef.current = hasNextPage
    isFetchingNextPageRef.current = isFetchingNextPage
    fetchNextPageRef.current = fetchNextPage
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const setupScrollListener = (listElement: HTMLDivElement | null) => {
    if (!listElement) {
      return () => {}
    }

    const scrollableContainerElement = listElement.closest('[data-slot="combobox-popup"]')
    if (!scrollableContainerElement) {
      return () => {}
    }
    const scrollableContainer = scrollableContainerElement as HTMLElement

    function handleScroll() {
      const { scrollTop, scrollHeight, clientHeight } = scrollableContainer
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100

      if (isNearBottom && hasNextPageRef.current && !isFetchingNextPageRef.current) {
        fetchNextPageRef.current()
      }
    }

    scrollableContainer.addEventListener('scroll', handleScroll)
    return () => {
      scrollableContainer.removeEventListener('scroll', handleScroll)
    }
  }

  useEffect(() => {
    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = null
    }

    cleanupRef.current = setupScrollListener(listRef.current)
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
    }
  }, [])

  const { mutate, isPending } = useMutation({
    ...createOrgOptions(),
    // README: Override default onSuccess behavior
    // onSuccess: (...args) => {
    //   createOrgOptions().onSuccess?.(...args)
    //   Additional custom behavior can be added here
    // },
  })
  const { mutate: mutateUpdate, isPending: isLoadingUpdate } = useMutation({
    ...updateOrgOptions(),
  })
  const { mutate: mutateUpdateOrgForOrg } = useMutation({
    ...updateOrgForOrgOptions(),
  })

  const isUpdateMode = !!row
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = typeof open === 'boolean' && typeof onOpenChange === 'function'
  const dialogOpen = isControlled ? open : internalOpen

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (isControlled) {
      onOpenChange(nextOpen)
      return
    }

    setInternalOpen(nextOpen)
  }

  const form = useAppForm({
    defaultValues: {
      name: row?.name ?? '',
      org_id: row?.org_id ?? '',
      project_id: projectId,
      description: row?.description ?? '',
    } as z.input<typeof orgSchema>,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: orgSchema,
    },
    onSubmit: async ({ value }) => {
      if (row) {
        mutateUpdateOrgForOrg(
          { data: { ids: [row.id], org_id: value.org_id } },
          {
            onSuccess: () => {
              mutateUpdate({
                data: {
                  name: value.name,
                  org_id: value.org_id,
                  description: value.description,
                },
                org_id: row.id,
              })
            },
          },
        )
      }
      else {
        mutate({
          data: {
            ...value,
            project_id: projectId,
          },
        })
      }
    },
  })

  const { handleSubmit } = form

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
      <form.AppForm>
        <form.Form
          id={isUpdateMode ? 'update-org' : 'create-org'}
          onSubmit={handleSubmit}
        >
          {!isControlled && !isUpdateMode && (
            <DialogTrigger render={<Button className="h-[38px] w-28" />}>
              {t('schema:create')}
            </DialogTrigger>
          )}
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{isUpdateMode ? t('cloud:org_manage.org_manage.add_org.edit') : t('cloud:org_manage.org_manage.add_org.title')}</DialogTitle>
            </DialogHeader>
            <div className="mb-4 grid grid-cols-1 gap-y-4">
              <form.AppField name="name">
                {field => (
                  <field.FormItem>
                    <field.FormLabel>
                      {t('cloud:org_manage.org_manage.add_org.name')}
                      <span className="ps-1 text-primary">*</span>
                    </field.FormLabel>
                    <field.FormControl>
                      <Input
                        placeholder={t('cloud:org_manage.org_manage.add_org.name_placeholder')}
                        value={field.state.value}
                        onChange={e => field.handleChange(e.target.value)}
                        endIcon={
                          field.state.value && field.state.value.length > 0 ?
                            (
                              <X
                                className="absolute end-3 top-1/4 h-1/2 cursor-pointer"
                                onClick={() => field.handleChange('')}
                              />
                            )
                            : undefined
                        }
                      />
                    </field.FormControl>
                    <field.FormMessage />
                  </field.FormItem>
                )}
              </form.AppField>

              <form.AppField name="org_id">
                {field => {
                  const hasErrors = field.state.meta.errors.length > 0

                  return (
                    <field.FormItem>
                      <field.FormLabel>{t('cloud:org_manage.org_manage.add_org.org_name')}</field.FormLabel>
                      <field.FormControl>
                        <Combobox
                          items={allOrgs}
                          value={field.state.value}
                          onValueChange={value => {
                            field.handleChange(typeof value === 'string' ? value : '')
                          }}
                          itemToStringValue={(itemValue: unknown) => {
                            const org = itemValue as Org
                            return org.id
                          }}
                        >
                          <ComboboxControl>
                            <ComboboxValue>
                              <ComboboxInput
                                placeholder={t('cloud:org_manage.org_manage.add_org.org_name')}
                                aria-invalid={hasErrors}
                                aria-describedby={hasErrors ? `${field.name}-error` : undefined}
                              />
                            </ComboboxValue>
                            {field.state.value && <ComboboxClear />}
                            <ComboboxIcon />
                          </ComboboxControl>

                          <ComboboxContent>
                            <ComboboxEmpty>No organizations found.</ComboboxEmpty>
                            <ComboboxList
                              ref={element => {
                                listRef.current = element
                                if (cleanupRef.current) {
                                  cleanupRef.current()
                                }
                                cleanupRef.current = setupScrollListener(element)
                              }}
                            >
                              {(org: Org) => (
                                <ComboboxItem key={org.id} value={org.id}>
                                  <ComboboxItemIndicator />
                                  {org.name}
                                </ComboboxItem>
                              )}
                            </ComboboxList>
                            {isFetchingNextPage && (
                              <div className="p-2 text-center text-sm text-muted-foreground">
                                Loading more...
                              </div>
                            )}
                          </ComboboxContent>
                        </Combobox>
                      </field.FormControl>
                      <field.FormMessage id={`${field.name}-error`} />
                    </field.FormItem>
                  )
                }}
              </form.AppField>

              <form.AppField name="description">
                {field => (
                  <field.FormItem>
                    <field.FormLabel>{t('cloud:org_manage.org_manage.add_org.desc')}</field.FormLabel>
                    <field.FormControl>
                      <Textarea
                        className="resize-none"
                        rows={6}
                        value={field.state.value}
                        onChange={e => field.handleChange(e.target.value)}
                        placeholder={t('cloud:project_manager.add_project.description_placeholder')}
                      />
                    </field.FormControl>
                    <field.FormMessage />
                  </field.FormItem>
                )}
              </form.AppField>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                {t('btn:cancel')}
              </DialogClose>
              <Button disabled={isPending || isLoadingUpdate} type="submit">
                {t('btn:save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form.Form>
      </form.AppForm>
    </Dialog>
  )
}

function organizationListInfiniteQueryOptions(projectId: string, limit: number) {
  return {
    queryKey: ['organizations-infinite', projectId, limit] as const,
    queryFn: async ({ pageParam = 1 }: { pageParam: number }) => {
      return fetchOrganizations(pageParam, limit)
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: OrgList) => {
      const currentOffset = lastPage.offset
      const totalLoaded = currentOffset + lastPage.limit - 1
      if (totalLoaded < lastPage.total) {
        return currentOffset + lastPage.limit
      }
      return undefined
    },
    staleTime: 1000 * 10, // 10 seconds
  }
}
