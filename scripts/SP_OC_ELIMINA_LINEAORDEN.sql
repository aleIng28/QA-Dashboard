USE [Wopzi]
GO

ALTER PROCEDURE [dbo].[SP_OC_ELIMINA_LINEAORDEN]
@Id_Orden			BIGINT,
@Id_OrdenDetalle	BIGINT,
@Codigo				VARCHAR(10),
@Cantidad			INT,
@Id_TipoLinea		INT,
@Id_Promocional		INT
AS

DECLARE @ERROR						VARCHAR(500)	SET @ERROR = ''

DECLARE @Id_OrdenDetalleComponente	BIGINT			SET @Id_OrdenDetalleComponente = 0	
DECLARE	@CodigoComponente			VARCHAR(5)		SET @CodigoComponente = ''
DECLARE	@CantidadComponente			INT				SET @CantidadComponente = 0

DECLARE @Paquete					TINYINT			SET @Paquete		= 0
DECLARE @Id_Sucursal				INT				SET @Id_Sucursal	= 0

-- AGREGADAS PARA LA SOLUCIÓN
DECLARE @Id_DescuentoBase			INT
DECLARE @Id_VentaEspecial			INT
DECLARE @Id_DescuentoVentaEspecial	INT = 0

BEGIN
	SET NOCOUNT ON;	

	BEGIN TRY
		SET TRANSACTION
		ISOLATION LEVEL SERIALIZABLE

			PRINT 'SP_OC_ELIMINA_LINEAORDEN :'+ CONVERT(VARCHAR(50), @Id_Orden)	+','+ CONVERT(VARCHAR(50), @Id_OrdenDetalle) +','+ CONVERT(VARCHAR(10), @Codigo)	+','+ CONVERT(VARCHAR(10), @Cantidad)	+','+ CONVERT(VARCHAR(10), @Id_TipoLinea)	

			BEGIN TRANSACTION	

			IF @Id_TipoLinea = 1 
			BEGIN
				PRINT 'Es PT'
				DELETE	OC_OrdenesCompraDetalle 
				WHERE	Id_OrdenCompra = @Id_Orden
						AND Id_OrdenDetalle = @Id_OrdenDetalle
			END
			ELSE
			BEGIN
				PRINT 'Es Paquete'
				/*Elimina componentes paquete*/
				DECLARE CURCOMPONENTES CURSOR STATIC FOR
					SELECT	Id_OrdenDetalle,Codigo,Cantidad,Id_Promocional
					FROM	OC_OrdenesCompraDetalle 
					WHERE	Id_OrdenCompra = @Id_Orden
							AND CodigoPaquete = @Codigo
							AND Id_TipoLinea = 3	
							AND Id_Promocional = @Id_Promocional							
				OPEN CURCOMPONENTES
				FETCH NEXT FROM CURCOMPONENTES INTO @Id_OrdenDetalleComponente,@CodigoComponente,@CantidadComponente,@Id_Promocional
				WHILE @@FETCH_STATUS = 0
				BEGIN			
					
					DELETE	OC_OrdenesCompraDetalle 
					WHERE	Id_OrdenCompra = @Id_Orden
							AND Id_OrdenDetalle = @Id_OrdenDetalleComponente 
							AND Codigo = @CodigoComponente
							AND Id_Promocional = @Id_Promocional

				FETCH NEXT FROM CURCOMPONENTES INTO @Id_OrdenDetalleComponente,@CodigoComponente,@CantidadComponente,@Id_Promocional
				END
				CLOSE CURCOMPONENTES
				DEALLOCATE CURCOMPONENTES		
				
				/*Elimina Cabecerá Paquete*/
				DELETE	OC_OrdenesCompraDetalle 
				WHERE	Id_OrdenCompra = @Id_Orden
						AND Id_OrdenDetalle = @Id_OrdenDetalle
			END

			-- INICIA LA SOLUCIÓN PROPUESTA

			
			-- OBTIENE DATOS @Id_Sucursal y @Id_DescuentoBase
			SELECT 
				@Id_Sucursal = OC.Id_Sucursal,
				@Id_DescuentoBase = E.Id_DescuentoEmpresa
			FROM OC_OrdenesCompra OC
			INNER JOIN SYS_Sucursales S ON OC.Id_Sucursal = S.Id_Sucursal
			INNER JOIN SYS_Empresas E ON S.Id_Empresa = E.Id_Empresa
			WHERE OC.Id_OrdenCompra = @Id_Orden;

			-- SE VERIFICA SI HAY VENTAS ESPECIALES VIGENTES DE AQUI SE OBTIENE @Id_VentaEspecial
			SELECT @Id_VentaEspecial = ISNULL(VE.Id_VentaEspecial, 0)
			FROM OC_VentasEspeciales VE 
			INNER JOIN OC_VentasEspeciales_Sucursales VES ON VE.Id_VentaEspecial = VES.Id_VentaEspecial
			WHERE VE.Activo = 1 
				  AND VES.Activo = 1
				  AND VES.Id_Sucursal = @Id_Sucursal
				  AND GETDATE() BETWEEN VE.FechaInicio AND VE.FechaFin;

			-- SI HAY VENTA ESPECIAL VALIDA PRODUCTOS
			IF @Id_VentaEspecial > 0 
			BEGIN
				IF NOT EXISTS (
					SELECT 1 FROM OC_OrdenesCompraDetalle OCD 
					INNER JOIN OC_VentasEspeciales_Codigos VEC ON OCD.Codigo = VEC.Codigo 
						AND VEC.Id_VentaEspecial = @Id_VentaEspecial
					WHERE OCD.Id_OrdenCompra = @Id_Orden
				)
				BEGIN
					-- SI NO HAY PRODUCTOS VALIDOS, SE LIMPIA LA VENTA ESPECIAL DE LA ORDEN
					SET @Id_VentaEspecial = 0
					EXEC SP_OC_LIMPIA_DESCUENTOVENTAESPECIAL_ORDEN @Id_Orden
				END
				ELSE
				BEGIN
					-- SI HAY PRODUCTOS VALIDOS, SE CONSULTA EL NUEVO DESCUENTO
					EXEC SP_OC_CONSULTA_DESCUENTOVENTAESPECIAL 
						@Id_VentaEspecial, @Id_Sucursal, @Id_DescuentoBase, @Id_Orden, 
						@Id_DescuentoVentaEspecial OUTPUT;
				END
			END

			-- ACTUALIZA LOS DESCUENTOS
			EXEC SP_OC_ACTUALIZA_DESCUENTOSORDENDETALLE 
				@Id_Orden, @Id_DescuentoBase, @Id_VentaEspecial, @Id_DescuentoVentaEspecial;

			COMMIT TRANSACTION				
		
	END TRY
	BEGIN CATCH	

		IF CURSOR_STATUS('global','CURCOMPONENTES') >= 0
		BEGIN
			CLOSE CURCOMPONENTES
			DEALLOCATE CURCOMPONENTES
		END

		SET @ERROR = ERROR_MESSAGE() 
		PRINT @ERROR
		IF @@TRANCOUNT > 0
			ROLLBACK TRANSACTION;
		THROW;			
	END CATCH
END