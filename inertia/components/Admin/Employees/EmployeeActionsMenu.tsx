import { useRef } from 'react';
import { Menu, MenuButton, MenuList, MenuItem, IconButton, Box } from '@chakra-ui/react';
import { More, Eye, Edit2, Trash } from 'iconsax-react';
import { useTranslation } from 'react-i18next';
import ViewEmployee from './ViewEmployee';
import EditEmployee from './EditEmployee';
import DeleteEmployee from './DeleteEmployee';

interface EmployeeActionsMenuProps {
  employee: Record<string, any>;
  refresh: () => void;
}

export default function EmployeeActionsMenu({ employee, refresh }: EmployeeActionsMenuProps) {
  const { t } = useTranslation();
  const viewButtonRef = useRef<HTMLDivElement>(null);
  const editButtonRef = useRef<HTMLDivElement>(null);
  const deleteButtonRef = useRef<HTMLDivElement>(null);

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const viewButton = viewButtonRef.current?.querySelector('button');
    if (viewButton) {
      viewButton.click();
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const editButton = editButtonRef.current?.querySelector('button');
    if (editButton) {
      editButton.click();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const deleteButton = deleteButtonRef.current?.querySelector('button');
    if (deleteButton) {
      deleteButton.click();
    }
  };

  return (
    <>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label={t('Employee actions')}
          icon={<More size="20" color="currentColor" />}
          variant="ghost"
          size="sm"
          colorScheme="gray"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
          }}
        />
        <MenuList>
          <MenuItem
            icon={<Eye size="18" />}
            onClick={handleViewClick}
          >
            {t('View')}
          </MenuItem>
          <MenuItem
            icon={<Edit2 size="18" />}
            onClick={handleEditClick}
          >
            {t('Edit')}
          </MenuItem>
          <MenuItem
            icon={<Trash size="18" />}
            onClick={handleDeleteClick}
            color="red.500"
          >
            {t('Delete')}
          </MenuItem>
        </MenuList>
      </Menu>
      {/* Hidden trigger buttons */}
      <Box position="absolute" left="-9999px" opacity={0} pointerEvents="none" width="1px" height="1px" overflow="hidden">
        <div ref={viewButtonRef}>
          <ViewEmployee employee={employee} refresh={refresh} />
        </div>
        <div ref={editButtonRef}>
          <EditEmployee isIconButton employee={employee} refresh={refresh} />
        </div>
        <div ref={deleteButtonRef}>
          <DeleteEmployee isIconButton id={employee.id} refresh={refresh} />
        </div>
      </Box>
    </>
  );
}

