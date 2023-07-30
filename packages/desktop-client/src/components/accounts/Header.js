import React, { useState, useRef } from 'react';

import useSyncServerStatus from '../../hooks/useSyncServerStatus';
import AnimatedLoading from '../../icons/AnimatedLoading';
import Add from '../../icons/v1/Add';
import ArrowsExpand3 from '../../icons/v2/ArrowsExpand3';
import ArrowsShrink3 from '../../icons/v2/ArrowsShrink3';
import DownloadThickBottom from '../../icons/v2/DownloadThickBottom';
import Pencil1 from '../../icons/v2/Pencil1';
import SvgRemove from '../../icons/v2/Remove';
import SearchAlternate from '../../icons/v2/SearchAlternate';
import { styles, colors } from '../../style';
import AnimatedRefresh from '../AnimatedRefresh';
import Button from '../common/Button';
import InitialFocus from '../common/InitialFocus';
import Input from '../common/Input';
import InputWithContent from '../common/InputWithContent';
import Menu from '../common/Menu';
import MenuButton from '../common/MenuButton';
import MenuTooltip from '../common/MenuTooltip';
import Stack from '../common/Stack';
import View from '../common/View';
import { FilterButton } from '../filters/FiltersMenu';
import { FiltersStack } from '../filters/SavedFilters';
import { KeyHandlers } from '../KeyHandlers';
import NotesButton from '../NotesButton';
import { SelectedTransactionsButton } from '../transactions/SelectedTransactions';
import { useSplitsExpanded } from '../transactions/TransactionsTable';

import { Balances } from './Balance';
import { ReconcilingMessage, ReconcileTooltip } from './Reconcile';

export function AccountHeader({
  tableRef,
  editingName,
  isNameEditable,
  workingHard,
  accountName,
  account,
  filterId,
  filtersList,
  accountsSyncing,
  accounts,
  transactions,
  showBalances,
  showExtraBalances,
  showCleared,
  showEmptyMessage,
  balanceQuery,
  reconcileAmount,
  canCalculateBalance,
  isSorted,
  search,
  filters,
  conditionsOp,
  savePrefs,
  onSearch,
  onAddTransaction,
  onShowTransactions,
  onDoneReconciling,
  onCreateReconciliationTransaction,
  onToggleExtraBalances,
  onSaveName,
  onExposeName,
  onSync,
  onImport,
  onMenuSelect,
  onReconcile,
  onBatchDelete,
  onBatchDuplicate,
  onBatchEdit,
  onBatchUnlink,
  onCreateRule,
  onApplyFilter,
  onUpdateFilter,
  onClearFilters,
  onReloadSavedFilter,
  onCondOpChange,
  onDeleteFilter,
  onScheduleAction,
}) {
  let [menuOpen, setMenuOpen] = useState(false);
  let searchInput = useRef(null);
  let splitsExpanded = useSplitsExpanded();

  let canSync = account && account.account_id;
  if (!account) {
    // All accounts - check for any syncable account
    canSync = !!accounts.find(account => !!account.account_id);
  }

  function onToggleSplits() {
    if (tableRef.current) {
      splitsExpanded.dispatch({
        type: 'switch-mode',
        id: tableRef.current.getScrolledItem(),
      });

      savePrefs({
        'expand-splits': !(splitsExpanded.state.mode === 'expand'),
      });
    }
  }

  return (
    <>
      <KeyHandlers
        keys={{
          'ctrl+f, cmd+f': () => {
            if (searchInput.current) {
              searchInput.current.focus();
            }
          },
        }}
      />

      <View style={[styles.pageContent, { paddingBottom: 10, flexShrink: 0 }]}>
        <View style={{ marginTop: 2, alignItems: 'flex-start' }}>
          <View>
            {editingName ? (
              <InitialFocus>
                <Input
                  defaultValue={accountName}
                  onEnter={e => onSaveName(e.target.value)}
                  onBlur={() => onExposeName(false)}
                  style={{
                    fontSize: 25,
                    fontWeight: 500,
                    marginTop: -5,
                    marginBottom: -2,
                    marginLeft: -5,
                  }}
                />
              </InitialFocus>
            ) : isNameEditable ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 3,
                  '& .hover-visible': {
                    opacity: 0,
                    transition: 'opacity .25s',
                  },
                  '&:hover .hover-visible': {
                    opacity: 1,
                  },
                }}
              >
                <View
                  style={{
                    fontSize: 25,
                    fontWeight: 500,
                    marginRight: 5,
                    marginBottom: 5,
                  }}
                  data-testid="account-name"
                >
                  {account && account.closed
                    ? 'Closed: ' + accountName
                    : accountName}
                </View>

                {account && <NotesButton id={`account-${account.id}`} />}
                <Button
                  type="bare"
                  className="hover-visible"
                  onClick={() => onExposeName(true)}
                >
                  <Pencil1
                    style={{
                      width: 11,
                      height: 11,
                      color: colors.n8,
                    }}
                  />
                </Button>
              </View>
            ) : (
              <View
                style={{ fontSize: 25, fontWeight: 500, marginBottom: 5 }}
                data-testid="account-name"
              >
                {account && account.closed
                  ? 'Closed: ' + accountName
                  : accountName}
              </View>
            )}
          </View>
        </View>

        <Balances
          balanceQuery={balanceQuery}
          showExtraBalances={showExtraBalances}
          onToggleExtraBalances={onToggleExtraBalances}
          account={account}
        />

        <Stack
          spacing={2}
          direction="row"
          align="center"
          style={{ marginTop: 12 }}
        >
          {((account && !account.closed) || canSync) && (
            <Button type="bare" onClick={canSync ? onSync : onImport}>
              {canSync ? (
                <>
                  <AnimatedRefresh
                    width={13}
                    height={13}
                    animating={
                      (account && accountsSyncing === account.name) ||
                      accountsSyncing === '__all'
                    }
                    style={{ marginRight: 4 }}
                  />{' '}
                  Sync
                </>
              ) : (
                <>
                  <DownloadThickBottom
                    width={13}
                    height={13}
                    style={{ marginRight: 4 }}
                  />{' '}
                  Import
                </>
              )}
            </Button>
          )}
          {!showEmptyMessage && (
            <Button type="bare" onClick={onAddTransaction}>
              <Add width={10} height={10} style={{ marginRight: 3 }} /> Add New
            </Button>
          )}
          <View>
            <FilterButton onApply={onApplyFilter} />
          </View>
          <InputWithContent
            leftContent={
              <SearchAlternate
                style={{
                  width: 13,
                  height: 13,
                  flexShrink: 0,
                  color: search ? colors.p7 : 'inherit',
                  margin: 5,
                  marginRight: 0,
                }}
              />
            }
            rightContent={
              search && (
                <Button
                  type="bare"
                  style={{ padding: 8 }}
                  onClick={() => onSearch('')}
                  title="Clear search term"
                >
                  <SvgRemove style={{ width: 8, height: 8 }} />
                </Button>
              )
            }
            inputRef={searchInput}
            value={search}
            placeholder="Search"
            onKeyDown={e => {
              if (e.key === 'Escape') onSearch('');
            }}
            getStyle={focused => [
              {
                backgroundColor: 'transparent',
                borderWidth: 0,
                boxShadow: 'none',
                transition: 'color .15s',
                '& input::placeholder': {
                  color: colors.n1,
                  transition: 'color .25s',
                },
              },
              focused && { boxShadow: '0 0 0 2px ' + colors.b5 },
              !focused && search !== '' && { color: colors.p4 },
            ]}
            onChange={e => onSearch(e.target.value)}
          />
          {workingHard ? (
            <View>
              <AnimatedLoading
                color={colors.n1}
                style={{ width: 16, height: 16 }}
              />
            </View>
          ) : (
            <SelectedTransactionsButton
              getTransaction={id => transactions.find(t => t.id === id)}
              onShow={onShowTransactions}
              onDuplicate={onBatchDuplicate}
              onDelete={onBatchDelete}
              onEdit={onBatchEdit}
              onUnlink={onBatchUnlink}
              onCreateRule={onCreateRule}
              onScheduleAction={onScheduleAction}
            />
          )}
          <Button
            type="bare"
            disabled={search !== '' || filters.length > 0}
            style={{ padding: 6 }}
            onClick={onToggleSplits}
            title={
              splitsExpanded.state.mode === 'collapse'
                ? 'Collapse split transactions'
                : 'Expand split transactions'
            }
          >
            {splitsExpanded.state.mode === 'collapse' ? (
              <ArrowsShrink3 style={{ width: 14, height: 14 }} />
            ) : (
              <ArrowsExpand3 style={{ width: 14, height: 14 }} />
            )}
          </Button>
          {account ? (
            <View>
              <MenuButton onClick={() => setMenuOpen(true)} />

              {menuOpen && (
                <AccountMenu
                  account={account}
                  canSync={canSync}
                  canShowBalances={canCalculateBalance()}
                  isSorted={isSorted}
                  showBalances={showBalances}
                  showCleared={showCleared}
                  onMenuSelect={item => {
                    setMenuOpen(false);
                    onMenuSelect(item);
                  }}
                  onReconcile={onReconcile}
                  onClose={() => setMenuOpen(false)}
                />
              )}
            </View>
          ) : (
            <View>
              <MenuButton onClick={() => setMenuOpen(true)} />

              {menuOpen && (
                <CategoryMenu
                  onMenuSelect={item => {
                    setMenuOpen(false);
                    onMenuSelect(item);
                  }}
                  onClose={() => setMenuOpen(false)}
                  isSorted={isSorted}
                />
              )}
            </View>
          )}
        </Stack>

        {filters && filters.length > 0 && (
          <FiltersStack
            filters={filters}
            conditionsOp={conditionsOp}
            onUpdateFilter={onUpdateFilter}
            onDeleteFilter={onDeleteFilter}
            onClearFilters={onClearFilters}
            onReloadSavedFilter={onReloadSavedFilter}
            filterId={filterId}
            filtersList={filtersList}
            onCondOpChange={onCondOpChange}
          />
        )}
      </View>
      {reconcileAmount != null && (
        <ReconcilingMessage
          targetBalance={reconcileAmount}
          balanceQuery={balanceQuery}
          onDone={onDoneReconciling}
          onCreateTransaction={onCreateReconciliationTransaction}
        />
      )}
    </>
  );
}

function AccountMenu({
  account,
  canSync,
  showBalances,
  canShowBalances,
  showCleared,
  onClose,
  isSorted,
  onReconcile,
  onMenuSelect,
}) {
  let [tooltip, setTooltip] = useState('default');
  const syncServerStatus = useSyncServerStatus();

  return tooltip === 'reconcile' ? (
    <ReconcileTooltip
      account={account}
      onClose={onClose}
      onReconcile={onReconcile}
    />
  ) : (
    <MenuTooltip width={200} onClose={onClose}>
      <Menu
        onMenuSelect={item => {
          if (item === 'reconcile') {
            setTooltip('reconcile');
          } else {
            onMenuSelect(item);
          }
        }}
        items={[
          isSorted && {
            name: 'remove-sorting',
            text: 'Remove all Sorting',
          },
          canShowBalances && {
            name: 'toggle-balance',
            text: (showBalances ? 'Hide' : 'Show') + ' Running Balance',
          },
          {
            name: 'toggle-cleared',
            text: (showCleared ? 'Hide' : 'Show') + ' “Cleared” Checkboxes',
          },
          { name: 'export', text: 'Export' },
          { name: 'reconcile', text: 'Reconcile' },
          account &&
            !account.closed &&
            (canSync
              ? {
                  name: 'unlink',
                  text: 'Unlink Account',
                }
              : syncServerStatus === 'online' && {
                  name: 'link',
                  text: 'Link Account',
                }),
          account.closed
            ? { name: 'reopen', text: 'Reopen Account' }
            : { name: 'close', text: 'Close Account' },
        ].filter(x => x)}
      />
    </MenuTooltip>
  );
}

function CategoryMenu({ onClose, onMenuSelect, isSorted }) {
  return (
    <MenuTooltip width={200} onClose={onClose}>
      <Menu
        onMenuSelect={item => {
          onMenuSelect(item);
        }}
        items={[
          isSorted && {
            name: 'remove-sorting',
            text: 'Remove all Sorting',
          },
          { name: 'export', text: 'Export' },
        ]}
      />
    </MenuTooltip>
  );
}