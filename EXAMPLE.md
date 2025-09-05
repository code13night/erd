erDiagram
    CUSTOMER {
        int CustomerID PK
        string Name
        string Address
        string Contact
        string Email
    }

    SALES_ORDER {
        int SalesOrderID PK
        date OrderDate
        string Status
        int CustomerID FK
    }

    SALES_ORDER_LINE {
        int SalesOrderLineID PK
        int SalesOrderID FK
        int ProductID FK
        int Quantity
        decimal UnitPrice
    }

    PRODUCT {
        int ProductID PK
        string Name
        string SKU
        string Category
        decimal StandardCost
        decimal ListPrice
    }

    BOM {
        int BOMID PK
        int ProductID FK
        int MaterialID FK
        int Quantity
    }

    MATERIAL {
        int MaterialID PK
        string Name
        string UOM
        decimal StandardCost
    }

    SUPPLIER {
        int SupplierID PK
        string Name
        string Address
        string Contact
        string Email
    }

    PURCHASE_ORDER {
        int PurchaseOrderID PK
        date OrderDate
        string Status
        int SupplierID FK
    }

    PURCHASE_ORDER_LINE {
        int PurchaseOrderLineID PK
        int PurchaseOrderID FK
        int MaterialID FK
        int Quantity
        decimal UnitPrice
    }

    INVENTORY {
        int InventoryID PK
        int MaterialID FK
        int ProductID FK
        int WarehouseID FK
        int QuantityOnHand
    }

    WAREHOUSE {
        int WarehouseID PK
        string Name
        string Location
    }

    PRODUCTION_PLAN {
        int PlanID PK
        date PlanDate
        string Status
    }

    WORK_ORDER {
        int WorkOrderID PK
        int PlanID FK
        int ProductID FK
        date StartDate
        date EndDate
        string Status
    }

    %% Relationships
    CUSTOMER ||--o{ SALES_ORDER : places
    SALES_ORDER ||--|{ SALES_ORDER_LINE : contains
    PRODUCT ||--o{ SALES_ORDER_LINE : ordered

    PRODUCT ||--o{ BOM : has
    BOM ||--|{ MATERIAL : requires

    SUPPLIER ||--o{ PURCHASE_ORDER : supplies
    PURCHASE_ORDER ||--|{ PURCHASE_ORDER_LINE : contains
    MATERIAL ||--o{ PURCHASE_ORDER_LINE : requested

    MATERIAL ||--o{ INVENTORY : stored
    PRODUCT ||--o{ INVENTORY : stocked
    WAREHOUSE ||--o{ INVENTORY : located

    PRODUCTION_PLAN ||--o{ WORK_ORDER : schedules
    WORK_ORDER ||--o{ PRODUCT : produces
    WORK_ORDER ||--o{ MATERIAL : consumes